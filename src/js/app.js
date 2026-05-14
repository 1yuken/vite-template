import Alpine from 'alpinejs';
import 'virtual:svg-icons-register';
import '@/sass/app.sass';
import { sayHello } from '@/js/lib/sayHello.js';

window.Alpine = Alpine;
Alpine.start();

sayHello();
