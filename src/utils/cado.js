import Cado from 'cado';

const { config } = global.app;

const cado = new Cado({ filename: config.database });

export default cado;
