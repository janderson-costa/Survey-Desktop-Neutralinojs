export interface Result<T> {
	// Padrão de retorno para funções em geral.

	data: T | null;
	error: string | null;
	canceled: boolean;
}

export function createResult(): Result<any> {
	return {
		data: null,
		error: null,
		canceled: false,
	};
}
