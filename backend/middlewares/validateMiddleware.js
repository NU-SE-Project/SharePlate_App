export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(", ");
      const err = new Error(msg);
      err.statusCode = 400;
      return next(err);
    }

    // Store validated data for controllers to use
    req.validated = result.data;
    next();
  };
}
