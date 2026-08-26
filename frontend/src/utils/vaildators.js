export const validateEmail = (email) => {
  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Enter a valid email";
  }

  return null;
};


export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};


export const validateRegister = ({
  username,
  email,
  password,
  confirmPassword,
}) => {
  if (!username.trim()) {
    return "Username is required";
  }

  if (username.trim().length < 3) {
    return "Username must be at least 3 characters";
  }

  const emailError = validateEmail(email);

  if (emailError) {
    return emailError;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return passwordError;
  }

  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};


export const validateLogin = ({
  email,
  password,
}) => {
  const emailError = validateEmail(email);

  if (emailError) {
    return emailError;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return passwordError;
  }

  return null;
};


export const validateForgotPassword = (email) => {
  return validateEmail(email);
};


export const validateResetPassword = ({
  email,
  password,
  confirmPassword,
}) => {

  const passwordError = validatePassword(password);

  if (passwordError) {
    return passwordError;
  }
  const emailError = validateEmail(email);

  if (emailError) {
    return emailError;
  }

  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};
