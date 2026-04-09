const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.validatedBody = validated;
            next();
        } catch (err) {
            next(err);
        }
    }
}

export { validate };
