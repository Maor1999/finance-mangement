
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

const validateQuery = (schema) =>(req, res, next) => {
    try { 
        const parsedQuery = schema.parse(req.query);
        req.validatedQuery = parsedQuery;
        next();
    }
    catch (err) {
        next(err)
    }
}

const validateParams = (schema) => (req, res, next) => {
    try {
        const parsedParams = schema.parse(req.params);
        req.validatedParams = parsedParams;
        next();
    }
    catch (err) {
        next(err);
    }
};

export { validate, validateQuery, validateParams };