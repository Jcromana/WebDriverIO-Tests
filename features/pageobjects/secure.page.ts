import { $ } from '@wdio/globals'
import Page from './page.js';

/**
 * sub page for specific page with selectors and methods
 */
class SecurePage extends Page {
    /**
     * define selectors using getter methods
     */
    public get flashAlert () {
        return $('#flash');
    }
}

export default new SecurePage();
