import { speak } from "./tts.js"
import {
  cssSelectorDialog,
  cssSelectorQuiz,
  dataLangSelector,
  speakButtonText,
  h5pContentTypeNames,
  eventNames,
  baseLang
} from './config.js'
const H5P = window.H5P || {};


/**
 * H5P-Text Utilities
 *
 * Some functions that can be useful when dealing with texts in H5P.
 *
 * param {H5P.jQuery} $
 */
H5P.TTS = (function () {
  'use strict';
  let buttonsVisibleAfterBlur = false;
  /**
   * Create Text Utilities.
   *
   * Might be needed later.
   *
   * @constructor
   */
  function TTS() {

  }

  // Inheritance
  TTS.prototype = Object.create(H5P.EventDispatcher.prototype);
  TTS.prototype.constructor = TTS;

  const onInitialized = () => {
    console.log("init event", H5P.instances);
    (H5P.instances || []).forEach(processH5pInstance);
  }

  const processH5pInstance = instance => {
    console.log("attaching handler to all events for all h5p instances")
    //handler for events
    if (Object.values(h5pContentTypeNames.base).includes(instance.libraryInfo.machineName)) {
      buttonsVisibleAfterBlur = (instance.libraryInfo.machineName === h5pContentTypeNames.h5pBlanksName)
      instance.on(eventNames.resize, baseInstanceEventHandler);
    }
     if (Object.values(h5pContentTypeNames.listening).includes(instance.libraryInfo.machineName)) {
       console.log("init", instance.libraryInfo.machineName);
       instance.on(eventNames.resize, listeningInstanceEventHandler);
    }

  }
  const listeningInstanceEventHandler = (event) => {
    //@todo find hidden dom elem with data
    //place visible button beside element
    //button event handler - call speak func
   
  }
  const baseInstanceEventHandler = (event) => {
    // console.log('inst', instance.libraryInfo.machineName, 'Event:', event.type, event.data);
    //this code only should run on selected content types
    // resize event is only event that fires when dom changes



    // this func find the correct element(s) to add buttons to 
    // it also gets the lang from html data and passes it
    // to the func that adds button and does assorted logic
    const addAllButtons = (i, el) => {

      let lang;
      const $paragraphs = H5P.jQuery(el)
        .find('p')
        .filter(function () {
          const lang = H5P.jQuery(this).data(dataLangSelector);
          if (typeof lang === 'string' &&
            lang.length > 0)
            return true;
        });
      console.log("paragraphs found: ", $paragraphs.length)
      $paragraphs.each((i, el) => addButton(el, H5P.jQuery(this).data(dataLangSelector)))
    }
    // this func creates a button with a onclick handler
    // appends button to element
    // records that button has been added to prevent repeats
    // onclick handler calls speak with lang and "text()" of el 
    const addButton = (element, lang) => {
      if (!lang) lang = baseLang;
      // Wrap the current element parameter in jQuery

      const $el = H5P.jQuery(element);
      if ($el.data('processed')) return;
      $el.data('processed', true);

      console.log("processing element:", element);
      const $btn = createButton($el.text(), lang);
      if (buttonsVisibleAfterBlur) {
        $btn.hide();
        $el.find('input').on('blur', (e) => {
          $btn.show();
        });
        H5P.jQuery('.h5p-question-content')
          .find('div')
          .css('border-bottom', '1px solid #ccc');
      }
      $el.append($btn);
    };
    const createButton = (speakText, lang) => {
      const $btn = H5P.jQuery(`<button>${speakButtonText}</button>`);
      //@todo move css somewhere better?
      $btn.css('margin-left', '5px');
      $btn.on('click', (e) => {
        e.stopPropagation();
        speak(speakText, lang);
      });
      return $btn;
    }
    //just getting dialogs
    const $dialogs = H5P.jQuery(cssSelectorDialog);
    const $quizzes = H5P.jQuery(cssSelectorQuiz);
    const $els = $dialogs.add($quizzes);

    $els.each(addAllButtons);
    console.log('els length',
      $els.length,
      "Dialogs length",
      $dialogs.length,
      "Quizzes length",
      $quizzes.length);

  }
  //after init we assign listener for all events on all instances
  H5P.externalDispatcher.on(eventNames.initialized, onInitialized);

  return TTS;
})()


