import { z } from 'zod';

/**
 * Schema de validação para criação de comentários públicos.
 * Protege contra payloads gigantes, injeção de campos e dados inválidos.
 */
export const CreateCommentSchema = z.object({
  postId: z.string().uuid({ message: "ID do post inválido" }),
  author: z.string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome muito longo" }),
  email: z.string().email({ message: "E-mail inválido" }),
  content: z.string()
    .min(1, { message: "Conteúdo não pode estar vazio" })
    .max(5000, { message: "Comentário muito longo (máximo 5000 caracteres)" }),
  parentId: z.string().uuid().optional().nullable(),
  captchaToken: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
