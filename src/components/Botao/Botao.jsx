import './Botao.css';

const Botao = ({
    texto,
    aoClicar,
    icone
}) => {
    return (
        <button
            className={"botao"}
            onClick={aoClicar}
        >
            {icone && <span className={"icone-botao"}>{icone}</span>}
            {texto}
        </button>
    );
}

export default Botao;