import './common';

import '../assets/scripts/custom';
/* eslint-disable tree-shaking/no-side-effects-in-initialization */
import $ from 'jquery';

$(document).ready(() => {
    window.Materialize.updateTextFields();
});

/* eslint-enable tree-shaking/no-side-effects-in-initialization */
