import { checkIfLogedIn } from '../called/loginCheck.js';
import { inTransition, indicatorClick } from './load.js';
const slider = document.querySelector('.indicator-slider');
const dots = document.querySelectorAll('.indicator-dot');
const contentTitle = document.getElementById('current-title');
        
        const sectionData = {
            1: { title: "Djelovi"},
            2: { title: "Servis"},
            3: { title: "Login"},
            4: { title: "Login needed"}
        };

        /**
         * Funkcija koja ažurira indikatore i sadržaj
         * @param {number} position - Nova pozicija (1, 2 ili 3)
         */
    export function updateIndicators(position) {
            const newPosition = position.toString();

            // 1. Ažuriraj active klasu na točkama
            dots.forEach(dot => dot.classList.remove('active'));
            const activeDot = document.querySelector(`.indicator-dot[data-position="${newPosition}"]`);
            if (activeDot) {
                activeDot.classList.add('active');
            }

            // 2. Ažuriraj klasu na slideru za rotaciju kazaljke
            slider.classList.remove('rot-1', 'rot-2', 'rot-3');
            slider.classList.add(`rot-${newPosition}`);
            
            // 3. Ažuriraj simulirani sadržaj
            if (!checkIfLogedIn() && position == 2) {
                contentTitle.textContent = sectionData[4].title;
            }
            else
            contentTitle.textContent = sectionData[newPosition].title;
        }

        // Dodaj event listenere na točke
        dots.forEach(dot => {
            dot.addEventListener('click', (event) => {
                if (!inTransition()) {
                    const newPosition = parseInt(event.target.getAttribute('data-position'));
                    indicatorClick(newPosition);
                    updateIndicators(newPosition);
                }
                
            });
        });

        // INICIJALIZACIJA: Postavi početnu poziciju (1) pri učitavanju
        document.addEventListener('DOMContentLoaded', () => {
            updateIndicators(1);
        });