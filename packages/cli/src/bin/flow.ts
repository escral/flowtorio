import consola from 'consola'
import { stdin } from 'process'

consola.success('Hurray!')

stdin.read().then(data => {
    consola.log(data)
})
