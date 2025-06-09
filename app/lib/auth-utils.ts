import { prisma } from './prisma';
import { verifyPassword, generateToken } from './auth';

type Cookie = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
  };
};

interface LoginResult {
  success: boolean;
  user?: any;
  error?: string;
  redirectUrl?: string;
  cookies?: Cookie[];
}

export async function handleLogin(email: string, password: string, type: 'user' | 'analyst'): Promise<LoginResult> {
  try {
    // Input validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Find user based on type
    let user;
    if (type === 'analyst') {
      user = await prisma.analyst.findUnique({ where: { email } });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Generate token with user info and type
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: type
    });

    // Create user object with token
    const userWithToken = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: type,
      token: token // Include token for cookie setting
    };

    // Create cookies array
    const cookies: Cookie[] = [
      {
        name: 'auth-token',
        value: token,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        }
      },
      {
        name: 'user-data',
        value: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          type: type
        }),
        options: {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        }
      }
    ];

    // Return absolute URLs for redirection
    const redirectPath = type === 'analyst' ? '/analyst/dashboard' : '/dashboard';
    
    return {
      success: true,
      user: userWithToken,
      redirectUrl: redirectPath
    };
  } catch (error) {
    console.error(`${type} login error:`, error);
    return { success: false, error: 'An error occurred during login' };
  }
}
