import { Ativos } from "@/types/ativo";

const ativosMock: Ativos[] = [
  {
    id: "1",
    Item: "Cadeira Gamer",
    data: new Date().toISOString(),
    categoria: "tenologico",
    local: "prefeitura",
    StatusAtivo:"bom",
  },
  {
    id: "2",
    Item: "Mesa ultrawide",
    data: new Date().toISOString(),
    categoria: "tenologico",
    local: "prefeitura",
    StatusAtivo:"ruim",
  },
  {
    id: "3",
    Item: "Geladeira Samsung",
    data: new Date().toISOString(),
    categoria: "tenologico",
    local: "prefeitura",
    StatusAtivo:"excelente",
  }
];
export default ativosMock;