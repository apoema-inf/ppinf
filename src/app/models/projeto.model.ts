export class Projeto {
    id: string;
    url: string;
    titulo: string;
    img: any;
    descricao: string;
    categorizacao: {
        area: string;
        status: string;
        coordenador: {
            nome: string, telefone: string, email: string
        };
        finalidade: string;
        financiamento: string;
        membros: any;
    }
    contexto: {
        contexto: any;
        quesitos: string;
        contratacao: any;
    }
}