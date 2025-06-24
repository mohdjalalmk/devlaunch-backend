function validateCourseInput({ title, description, isFree, price }) {
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    throw new Error('Title must be at least 3 characters long.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    throw new Error('Description must be at least 10 characters long.');
  }

  const finalIsFree = isFree ?? true;

  if (finalIsFree === false && (typeof price !== 'number' || price <= 0)) {
    throw new Error('Paid courses must have a valid positive price.');
  }

  if (finalIsFree === true && price && price !== 0) {
    throw new Error('Free courses should not have a price.');
  }
}

function validateCourseUpdate({ title, description, isFree, price }) {
  if (title && title.trim().length < 3) {
    throw new Error('Title must be at least 3 characters long.');
  }

  if (description && description.trim().length < 10) {
    throw new Error('Description must be at least 10 characters long.');
  }

  const isFreeDefined = typeof isFree !== 'undefined';
  const priceDefined = typeof price !== 'undefined';
  const finalIsFree = isFree ?? true;

  if ((isFreeDefined || priceDefined) && !finalIsFree && (!priceDefined || typeof price !== 'number' || price <= 0)) {
    throw new Error('Paid courses must have a valid positive price.');
  }

  if ((isFreeDefined || priceDefined) && finalIsFree && priceDefined && price !== 0) {
    throw new Error('Free courses should not have a price.');
  }
}

module.exports = { validateCourseInput,validateCourseUpdate };


