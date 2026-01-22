import Joi from "joi";

export const createThreadSchema = Joi.object({
    content: Joi.string().min(1).max(280).optional(),
    images: Joi.array().items(Joi.string()).optional(),
}).or("content", "images");
