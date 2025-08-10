/**
 * Clase Calculadora - Maneja la lógica y operaciones de una calculadora básica
 */
class Calculadora {
    /**
     * Constructor de la clase Calculadora
     * @param {HTMLElement} valorPrevioTextElement - Elemento HTML que muestra el valor previo
     * @param {HTMLElement} valorActualTextElement - Elemento HTML que muestra el valor actual
     */
    constructor(valorPrevioTextElement, valorActualTextElement) {
        // Almacena referencias a los elementos del DOM para mostrar los valores
        this.valorPrevioTextElement = valorPrevioTextElement
        this.valorActualTextElement = valorActualTextElement

        // bug1: limite de dígitos (solo números reales, sin contar '.' ni signo)
        this.maxDigits = 12

        // bug3: flag para detectar si lo último fue "=" (para resetear si viene número)
        this.despuesDeIgual = false

        // bug4: guardar la última expresión "A op B" para mostrar "A op B =" arriba
        this.ultimaExpresion = ''

        // Inicializa la calculadora limpiando todos los valores
        this.borrarTodo()
    }

    /**
     * Limpia todos los valores de la calculadora, resetea a estado inicial
     */
    borrarTodo() {
        this.valorActual = ''      // Valor que se está ingresando actualmente
        this.valorPrevio = ''      // Valor que se usará para la operación
        this.operacion = undefined // Tipo de operación seleccionada (+, -, x, ÷)

        // bug3 y 4: al limpiar, también limpiamos estado post-igual y expresión
        this.despuesDeIgual = false
        this.ultimaExpresion = ''
    }

    /**
     * Elimina el último dígito del valor actual
     */
    borrar() {
        // Convierte a string y remueve el último carácter usando slice
        this.valorActual = this.valorActual.toString().slice(0, -1)
    }

    /**
     * Agrega un número (dígito) al valor actual que se está ingresando
     * @param {string} numero - El dígito o punto decimal a agregar
     */
    agregarNumero(numero) {
        // bug3: si lo anterior fue "=", empezar una nueva operación al escribir un número
        if (this.despuesDeIgual) {
            this.valorActual = ''
            this.valorPrevio = ''
            this.operacion = undefined
            this.despuesDeIgual = false
            this.ultimaExpresion = ''
        }
      
        // Evita agregar múltiples puntos decimales
        if (numero === '.' && this.valorActual.includes('.')) return

        // bug1: aplicar límite de dígitos (no cuenta '.' ni '-')
        const soloDigitos = this.valorActual.replace('-', '').replace('.', '')
        if (numero !== '.' && soloDigitos.length >= this.maxDigits) return

        // Concatena el nuevo número al valor actual
        this.valorActual = this.valorActual.toString() + numero.toString()
    }

    /**
     * Selecciona la operación matemática a realizar
     * @param {string} operacion - El símbolo de la operación (+, -, x, ÷)
     */
    elejirOperacion(operacion) {
        // No hacer nada si no hay valor actual ingresado
        if (this.valorActual === '') return

        // Si ya hay un valor previo, calcular el resultado de la operación anterior
        if (this.valorPrevio !== '') {
            this.calcular()
        }
        // Almacena la operación seleccionada
        this.operacion = operacion
        // Mueve el valor actual al valor previo para la operación
        this.valorPrevio = this.valorActual
        // Limpia el valor actual para ingresar el siguiente número
        this.valorActual = ''

        // bug3: estamos en mitad de operación, ya no estamos "después de igual"
        this.despuesDeIgual = false
    }


    /**
     * Realiza el cálculo matemático según la operación seleccionada
     */
    calcular() {
        let resultado
        // Convierte los valores de string a números de punto flotante
        const valor_1 = parseFloat(this.valorPrevio)
        const valor_2 = parseFloat(this.valorActual)
        // Si algún valor no es un número válido, salir de la función
        if (isNaN(valor_1) || isNaN(valor_2)) return
        
        // Realiza el cálculo según el tipo de operación
        switch (this.operacion) {
            case '+':
                resultado = valor_1 + valor_2
                break
            case '-':
                resultado = valor_1 - valor_2
                break
            case 'x':
                resultado = valor_1 * valor_2
                break
            case '÷':
                resultado = valor_1 / valor_2
                break
            default:
                return
        }
        
        // bug4: guardar la expresión completa "A op B" para mostrarla arriba con "="
        this.ultimaExpresion = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`

        // Guarda el resultado como el valor actual
        this.valorActual = resultado
        // Limpia la operación y el valor previo
        this.operacion = undefined
        this.valorPrevio = ''

        // bug3: marcar que lo último fue "="
        this.despuesDeIgual = true
    }

    /**
     * Formatea un número para mostrarlo en pantalla con separadores de miles
     * @param {number} numero - El número a formatear
     * @returns {string} - El número formateado como string
     */
    obtenerNumero(numero) {
        const cadena = numero.toString()
        // Separa la parte entera de la decimal
        const enteros = parseFloat(cadena.split('.')[0])
        const decimales = cadena.split('.')[1]
        let mostrarEnteros
        
        // Si la parte entera no es un número válido, mostrar vacío
        if (isNaN(enteros)) {
            mostrarEnteros = ''
        } else {
            // Formatea los enteros con separadores de miles
            mostrarEnteros = enteros.toLocaleString('en', { maximumFractionDigits: 0 })
        }

        // Si hay decimales, los agrega al número formateado
        if (decimales != null) {
            return `${mostrarEnteros}.${decimales}`
        } else {
            return mostrarEnteros
        }
    }

    /**
     * Actualiza la pantalla de la calculadora con los valores actuales
     */
    actualizarPantalla() {
        // Muestra el valor actual formateado en el display principal
        this.valorActualTextElement.innerText = this.obtenerNumero(this.valorActual)

        // bug4: si venimos de "=", mostrar arriba "A op B =" osea la operacion con la que se esta trabajando usando ultimaExpresion
        if (this.despuesDeIgual && this.ultimaExpresion) {
            this.valorPrevioTextElement.innerText = `${this.ultimaExpresion} =`
            return
        }

        // Si hay una operación seleccionada, muestra el valor previo y la operación
        if (this.operacion != null) {
            // bug4: mostrar operación completa en vivo (A op B) si ya hay segundo operando
            if (this.valorActual !== '') {
                this.valorPrevioTextElement.innerText =
                    `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`
            } else {
                this.valorPrevioTextElement.innerText =
                    `${this.obtenerNumero(this.valorPrevio)} ${this.operacion}`
            }
        } else {
            this.valorPrevioTextElement.innerText = ''
        }
    }

    // bug2: funcionalidad del botón de porcentaje
    aplicarPorcentaje() {
        // si no hay nada, no hacemos nada
        if (this.valorActual === '' && this.valorPrevio === '') return

        const curr = parseFloat(this.valorActual || '0')
        if (isNaN(curr)) return

        if (this.operacion && this.valorPrevio !== '') {
            // interpretar B% como (A * B / 100) → "B% de A"
            const base = parseFloat(this.valorPrevio)
            if (!isNaN(base)) {
                this.valorActual = (base * curr) / 100
            }
        } else {
            // sin operación x% = x / 100
            this.valorActual = curr / 100
        }

        // Si ajustamos con %, ya no estamos "después de igual"
        this.despuesDeIgual = false
    }
}

/*
 * SECCIÓN DE INICIALIZACIÓN Y CONFIGURACIÓN DEL DOM
 * Esta sección maneja la captura de elementos DOM y la configuración inicial
 */

// Captura de elementos de botones numéricos (0-9 y punto decimal)
const numeroButtons = document.querySelectorAll('[data-numero]')
// Captura de elementos de botones de operaciones (+, -, x, ÷)
const operacionButtons = document.querySelectorAll('[data-operacion]')
// Captura del botón igual (=) para ejecutar cálculos
const igualButton = document.querySelector('[data-igual]')
// Captura del botón de porcentaje (%) - funcionalidad pendiente
const porcentajeButton = document.querySelector('[data-porcentaje]')
// Captura del botón para borrar último dígito (backspace)
const borrarButton = document.querySelector('[data-borrar]')
// Captura del botón para limpiar toda la calculadora (clear)
const borrarTodoButton = document.querySelector('[data-borrar-todo]')
// Captura del elemento que muestra el valor previo/operación en pantalla
const valorPrevioTextElement = document.querySelector('[data-valor-previo]')
// Captura del elemento que muestra el valor actual en pantalla
const valorActualTextElement = document.querySelector('[data-valor-actual]')

// Instancia principal de la calculadora con referencias a los elementos de display
const calculator = new Calculadora(valorPrevioTextElement, valorActualTextElement)

/*
 * CONFIGURACIÓN DE EVENT LISTENERS
 * Esta sección asigna eventos de click a cada tipo de botón
 */

// Asigna evento click a cada botón numérico
// Cuando se presiona un botón numérico, agrega ese número al valor actual y actualiza la pantalla
numeroButtons.forEach(button => {
    button.addEventListener('click', () => {
        // bug1 y 3: usar .trim() por si el HTML tiene espacios en el texto del botón
        calculator.agregarNumero(button.innerText.trim())
        calculator.actualizarPantalla()
    })
})

// Asigna evento click a cada botón de operación
// Cuando se presiona una operación (+, -, x, ÷), selecciona esa operación y actualiza la pantalla
operacionButtons.forEach(button => {
    button.addEventListener('click', () => {
        // bug3: quitar espacios; mantiene el mismo flujo original
        calculator.elejirOperacion(button.innerText.trim())
        calculator.actualizarPantalla()
    })
})

// Evento para el botón igual (=)
// Ejecuta el cálculo de la operación pendiente y muestra el resultado
igualButton.addEventListener('click', _button => {
    calculator.calcular()
    calculator.actualizarPantalla()
})

// Evento para el botón de borrar todo (AC/Clear)
// Limpia completamente la calculadora y vuelve al estado inicial
borrarTodoButton.addEventListener('click', _button => {
    calculator.borrarTodo()
    calculator.actualizarPantalla()
})

// Evento para el botón de borrar (DEL/Backspace)
// Elimina el último dígito ingresado del valor actual
borrarButton.addEventListener('click', _button => {
    calculator.borrar()
    calculator.actualizarPantalla()
})

// bug2: listener para el botón de porcentaje (antes no tenía lógica conectada)
porcentajeButton.addEventListener('click', _button => {
    calculator.aplicarPorcentaje()
    calculator.actualizarPantalla()
})

/*Laboratorio:
1. Arreglar bug que limite los numeros en pantalla
2. Funcionabilidad de boton de porcentaje
3. Si lo que se presiona despues de igual es un numero entonces que borre el resultado anterior e inicie una nueva operacion
4. Muestre la operacion completa en el display superior
*/
