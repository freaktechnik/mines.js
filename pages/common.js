import '../assets/scripts/l10n';
import '../assets/scripts/property-descriptor-fix';
import '../assets/scripts/register-service-worker';

import 'what-input';
import 'materialize-css/dist/js/materialize.js';

import 'materialize-css/bin/materialize.css';
import '../assets/styles/general.css';

import '../assets/images/icon-16.png';
import '../assets/images/icon-32.png';
import '../assets/images/icon-48.png';
import '../assets/images/icon-64.png';
import '../assets/images/icon-90.png';
import '../assets/images/icon-128.png';
import '../assets/images/icon-144.png';
import '../assets/images/icon-256.png';
import '../assets/images/icon-512.png';

import '../locales/de/app.properties';
import '../locales/el/app.properties';
import '../locales/en/app.properties';
import '../locales/eo/app.properties';
import '../locales/fr/app.properties';
import '../locales/it/app.properties';
import '../locales/nl/app.properties';
import '../locales/rm/app.properties';
import '../locales/ru/app.properties';

import Mines from '../src/mines';

$(document).ready(() => {
    $('.button-collapse').sideNav({
        edge: 'left',
        closeOnClick: true
    });

    //TODO doesn't work like it should at all
    document.getElementById("continuemenu").hidden = !Mines.hasSavedState();
});

