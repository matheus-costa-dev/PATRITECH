export interface Categoria {
  id_categoria: number;
  nome_categoria: string;
}

export interface Condicao {
  id_condicao: number;
  nome_condicao: string;
  gera_avaria: boolean;
}

export interface Localizacao {
  id_localizacao: number;
  nome_localizacao: string;
}

export interface Ativo {
  id_ativo: string;
  nome_ativo: string;
  id_categoria: number;
  id_condicao: number;
  id_localizacao: number;
  id_usuario_criador: string;
  id_lote?: number; // Adicionei este pois está no seu banco
  data_ultima_verificacao: string;
  data_criacao: string;
  // Joins
  categoria_ativo?: Categoria;
  condicao_ativo?: Condicao;
  localizacao?: Localizacao;
}