// No need for Ref import here

// Validate username field
export function validateUsername(
  username: string, 
  setFieldError: (field: string, error: string | null) => void,
  touchField: (field: string) => void
) {
  if (!username.trim()) {
    setFieldError('username', 'Username is required');
  } else if (username.length < 3) {
    setFieldError('username', 'Username must be at least 3 characters');
  } else {
    setFieldError('username', null);
  }
  touchField('username');
}

// Validate email field
export function validateEmail(
  email: string, 
  setFieldError: (field: string, error: string | null) => void,
  touchField: (field: string) => void
) {
  if (!email.trim()) {
    setFieldError('email', 'Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('email', 'Please enter a valid email address');
  } else {
    setFieldError('email', null);
  }
  touchField('email');
}

// Validate password field
export function validatePassword(
  password: string, 
  setFieldError: (field: string, error: string | null) => void,
  touchField: (field: string) => void
) {
  if (!password.trim()) {
    setFieldError('password', 'Password is required');
  } else if (password.length < 8) {
    setFieldError('password', 'Password must be at least 8 characters');
  } else {
    setFieldError('password', null);
  }
  touchField('password');
}