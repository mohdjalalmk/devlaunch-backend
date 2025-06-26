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
    throw new Error("Title must be at least 3 characters long.");
  }

  if (description && description.trim().length < 10) {
    throw new Error("Description must be at least 10 characters long.");
  }

  // Validate based on isFree
  if (isFree === true && price !== 0) {
    throw new Error("Free courses must have a price of 0.");
  }

  if (isFree === false && (typeof price !== "number" || price <= 0)) {
    throw new Error("Paid courses must have a valid price greater than 0.");
  }
}

module.exports = { validateCourseInput,validateCourseUpdate };


