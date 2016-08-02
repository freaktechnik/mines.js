import '../assets/scripts/l10n';
import '../assets/scripts/property-descriptor-fix';
import '../assets/scripts/register-service-worker';

import 'what-input';
import 'materialize-css/dist/js/materialize.js';

import 'materialize-css/dist/css/materialize.css';
import '../assets/styles/general.css';
import 'material-design-icons/iconfont/material-icons.css';

import '../locales/de/app.properties';
import '../locales/el/app.properties';
import '../locales/en/app.properties';
import '../locales/eo/app.properties';
import '../locales/fr/app.properties';
import '../locales/it/app.properties';
import '../locales/nl/app.properties';
import '../locales/rm/app.properties';
import '../locales/ru/app.properties';

import '../manifest.json';

import Mines from '../src/mines';

$(document).ready(() => {
    $('.button-collapse').sideNav({
        menuWidth: 300,
        edge: 'left',
        closeOnClick: true
    });

    document.getElementById("continuemenu").hidden = !Mines.hasSavedState();
});

