// __tests__/validation.test.js
import { jest } from '@jest/globals';

// 1) MOCK do isomorphic-dompurify
// Antes de importar o validation.js, dizemos ao Jest:
// "quando alguém importar 'isomorphic-dompurify', use esse objeto aqui".
jest.unstable_mockModule('isomorphic-dompurify', () => ({
  default: {
    sanitize: (str) =>
      typeof str === 'string'
        ? str.replace(/<script.*?>.*?<\/script>/gi, '')
        : str,
  },
  sanitize: (str) =>
    typeof str === 'string'
      ? str.replace(/<script.*?>.*?<\/script>/gi, '')
      : str,
}));

// 2) Agora, depois de mockar, importamos o módulo que usa o DOMPurify
const validationModule = await import('../src/config/validation.js');
const { default: serverValidation, serverValidation: namedServerValidation, validateRequest } =
  validationModule;

// ---------- TESTES ----------

describe('Estrutura de exports de validation.js', () => {
  test('default export deve ser igual a serverValidation nomeado', () => {
    expect(serverValidation).toBe(namedServerValidation);
  });
});

describe('serverValidation.email', () => {
  test('retorna erro quando email é ausente', () => {
    const result = serverValidation.email(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'Email é obrigatório',
    });
  });

  test('retorna erro quando formato é inválido', () => {
    const result = serverValidation.email('invalido@@');
    expect(result).toEqual({
      valid: false,
      error: 'Formato de email inválido',
    });
  });

  test('retorna sucesso e normaliza email válido', () => {
    const result = serverValidation.email('  USER@Example.COM  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('user@example.com');
  });
});

describe('serverValidation.username', () => {
  test('retorna erro quando username é ausente', () => {
    const result = serverValidation.username(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'Username é obrigatório',
    });
  });

  test('retorna erro quando username é muito curto', () => {
    const result = serverValidation.username('ab');
    expect(result).toEqual({
      valid: false,
      error: 'Username deve ter pelo menos 3 caracteres',
    });
  });

  test('retorna erro quando username é muito longo', () => {
    const result = serverValidation.username('a'.repeat(21));
    expect(result).toEqual({
      valid: false,
      error: 'Username deve ter no máximo 20 caracteres',
    });
  });

  test('retorna erro quando username tem caracteres inválidos', () => {
    const result = serverValidation.username('mario$');
    expect(result).toEqual({
      valid: false,
      error: 'Username deve conter apenas letras, números e underscore',
    });
  });

  test('retorna erro quando username é proibido', () => {
    const result = serverValidation.username('Admin');
    expect(result).toEqual({
      valid: false,
      error: 'Username não permitido',
    });
  });

  test('retorna sucesso quando username é válido', () => {
    const result = serverValidation.username('  mario_123  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('mario_123');
  });
});

describe('serverValidation.password', () => {
  test('retorna erro quando senha é ausente', () => {
    const result = serverValidation.password(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'Senha é obrigatória',
    });
  });

  test('retorna erro quando senha é muito curta', () => {
    const result = serverValidation.password('12345');
    expect(result).toEqual({
      valid: false,
      error: 'Senha deve ter pelo menos 6 caracteres',
    });
  });

  test('retorna erro quando senha é muito comum', () => {
    const result = serverValidation.password('123456');
    expect(result).toEqual({
      valid: false,
      error: 'Senha muito comum, escolha uma senha mais segura',
    });
  });

  test('retorna sucesso quando senha é válida', () => {
    const result = serverValidation.password('minhaSenhaSegura123');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('minhaSenhaSegura123');
  });
});

describe('serverValidation.movieId', () => {
  test('retorna erro quando id é ausente', () => {
    const result = serverValidation.movieId(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'ID do filme é obrigatório',
    });
  });

  test('retorna erro quando id não é número positivo', () => {
    const result = serverValidation.movieId('-10');
    expect(result).toEqual({
      valid: false,
      error: 'ID do filme deve ser um número positivo válido',
    });
  });

  test('retorna erro quando id é muito grande', () => {
    const result = serverValidation.movieId('1000000000');
    expect(result).toEqual({
      valid: false,
      error: 'ID do filme inválido',
    });
  });

  test('retorna sucesso quando id é válido', () => {
    const result = serverValidation.movieId('42');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(42);
  });
});

describe('serverValidation.movieTitle', () => {
  test('retorna erro quando título é ausente', () => {
    const result = serverValidation.movieTitle(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'Título do filme é obrigatório',
    });
  });

  test('retorna erro quando título é vazio após trim', () => {
    const result = serverValidation.movieTitle('   ');
    expect(result).toEqual({
      valid: false,
      error: 'Título não pode estar vazio',
    });
  });

  test('retorna erro quando título é muito longo', () => {
    const result = serverValidation.movieTitle('a'.repeat(201));
    expect(result).toEqual({
      valid: false,
      error: 'Título muito longo',
    });
  });

  test('retorna sucesso e sanitiza o título (mock)', () => {
    const result = serverValidation.movieTitle('<b>Filme</b> <script>alert(1)</script>');
    expect(result.valid).toBe(true);
    expect(result.value).not.toContain('<script>');
    expect(typeof result.value).toBe('string');
  });
});

describe('serverValidation.posterUrl', () => {
  test('aceita poster ausente como opcional', () => {
    const result = serverValidation.posterUrl(undefined);
    expect(result).toEqual({
      valid: true,
      value: null,
    });
  });

  test('retorna erro quando url não é string', () => {
    const result = serverValidation.posterUrl(123);
    expect(result).toEqual({
      valid: false,
      error: 'URL do poster deve ser uma string',
    });
  });

  test('retorna erro quando URL é inválida', () => {
    const result = serverValidation.posterUrl('htp://example.com');
    expect(result).toEqual({
      valid: false,
      error: 'URL do poster inválida',
    });
  });

  test('retorna sucesso quando URL é válida com http/https', () => {
    const result = serverValidation.posterUrl('https://example.com/poster.jpg');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('https://example.com/poster.jpg');
  });
});

describe('serverValidation.searchQuery', () => {
  test('retorna erro quando query é ausente', () => {
    const result = serverValidation.searchQuery(undefined);
    expect(result).toEqual({
      valid: false,
      error: 'Termo de busca é obrigatório',
    });
  });

  test('retorna erro quando query é vazia após trim', () => {
    const result = serverValidation.searchQuery('   ');
    expect(result).toEqual({
      valid: false,
      error: 'Termo de busca não pode estar vazio',
    });
  });

  test('retorna erro quando query é muito longa', () => {
    const result = serverValidation.searchQuery('a'.repeat(101));
    expect(result).toEqual({
      valid: false,
      error: 'Termo de busca muito longo',
    });
  });

  test('retorna sucesso e sanitiza query válida (mock)', () => {
    const result = serverValidation.searchQuery('  matrix <script> ');
    expect(result.valid).toBe(true);
    expect(result.value).not.toContain('<script>');
    expect(result.value.toLowerCase()).toContain('matrix');
  });
});

describe('validateRequest middleware', () => {
  test('chama next e preenche req.validatedData quando dados são válidos', () => {
    const middleware = validateRequest({
      email: serverValidation.email,
      username: serverValidation.username,
    });

    const req = {
      body: {
        email: 'user@example.com',
        username: 'mario_123',
      },
      params: {},
      query: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validatedData).toEqual({
      email: 'user@example.com',
      username: 'mario_123',
    });
  });

  test('retorna 400 e não chama next quando há dados inválidos', () => {
    const middleware = validateRequest({
      email: serverValidation.email,
      username: serverValidation.username,
    });

    const req = {
      body: {
        email: 'invalido@@',
        username: 'ab',
      },
      params: {},
      query: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Dados inválidos',
        errors: expect.arrayContaining([
          expect.stringContaining('email'),
          expect.stringContaining('username'),
        ]),
      }),
    );
  });
});
