/* Junta os arquivos de receitas. Para adicionar um grupo novo, crie o arquivo e inclua aqui. */
import pratos from './pratos.js';
import brasileiras from './brasileiras.js';
import doces from './doces.js';
import leves from './leves.js';

export default [...pratos, ...brasileiras, ...doces, ...leves];
