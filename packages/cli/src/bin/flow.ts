import consola from 'consola'
import { stdin } from 'process'

consola.success('Hurray!')

stdin.on('data', data => {
    consola.log('Input:', data.toString())
})
