import { body } from 'express-validator';
import prisma from '../prisma/client.js';

const emailErr = 'This email address is not valid.';
const nameLengthErr = 'must be between  2 and 50 characters.';
const alphaErr = 'must only contain letters.';
const strongPasswordErr = `must contain at least one capital letter, one lowercase letter, and one number.`;

const confirmationPasswordMatchPassword = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Confirmation password does not match the password.');
  }
  return true;
};

const emailNotInUse = async (value) => {
  const user = await prisma.user.findUnique({
    where: {
      username: value,
    },
  });

  if (user) {
    throw new Error('This email has already an account.');
  }
};

const signup = [
  body('username').trim().isEmail().withMessage(emailErr).custom(emailNotInUse),
  body('firstname')
    .trim()
    .isAlpha('fr-FR', { ignore: " '." })
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 2, max: 50 })
    .withMessage(`First name ${nameLengthErr}`),
  body('lastname')
    .trim()
    .isAlpha('fr-FR', { ignore: " '" })
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 2, max: 50 })
    .withMessage(`Last name ${nameLengthErr}`),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(`Password ${strongPasswordErr}`),
  body('password_confirmation').custom(confirmationPasswordMatchPassword),
];

const signin = [
  body('username').trim().isEmail().withMessage(emailErr),
  body('password').trim().notEmpty().withMessage('Password must not be empty.'),
];

const folderNameExists = (name, { req }) => {
  const exists = req.user.folders.some((folder) => folder.name === name);
  if (exists) {
    throw new Error(
      'A folder already exists with same name, choose another one.',
    );
  }
  return true;
};

const folder = body('folder_name')
  .trim()
  .isLength({ min: 1, max: 60 })
  .withMessage('Folder name must be between 1 and 60 characters.')
  .isAlphanumeric('fr-FR', { ignore: ' _-' })
  .withMessage('Invalid symbols in the folder name.')
  .custom(folderNameExists);

const share = body('share_duration')
  .trim()
  .isInt({ min: 1, max: 400 })
  .withMessage('Share duration must be an integer between 1 and 400 (days).');
export default { signup, signin, folder, share };
