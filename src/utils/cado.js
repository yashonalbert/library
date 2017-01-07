import Cado from 'cado';
import config from '../../config.json';

const cado = new Cado({ filename: config.database });

export default cado;
