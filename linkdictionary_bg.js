//Copyright 2021 MayKonm
//This software is released under the MIT License, see LICENSE.


var isDebug = false;
var isTestOnBrowser = false;


browser.menus.create({
    id: "menuDICT",
    title: "Open Dictionary",
    contexts: ["selection"]
});

browser.menus.create({
    id: "menuRST",
    title: "Read Selected Text",
    contexts: ["selection"]
});


if (isTestOnBrowser) {
    browser.menus.create({
        id: "menuTST",
        title: "Test",
        contexts: ["selection"]
    });
}

function debuglog(logmsg) {
//    if (isDebug) {
        console.log(logmsg);
//    }

}


function testlog(logmsg) {
 //   if (isTestOnBrowser) {
        if (typeof speechSynthesis === 'string') {
            console.log(logmsg);
        } else {
            console.table(logmsg);
        }
//    } else {
        //Will I write this code?
 //   }

}


function isLatinScript(selectedString) {
    debuglog("isLatinScript()");
    debuglog("parameter:")
    debuglog(selectedString);

    var lang = 0;

    //UNICODE SYMBOLS
    //https://en.wikipedia.org/wiki/Dash
    //figure dash 	? 	U + 2012 	figure dash &#x2012;&#8210; Ctrl +? Shiftu2012
    //en dash 	? 	U + 2013 	en dash & ndash; 	&#x2013;&#8211; --Alt + 0150[c]? Opt + - 	Compose--.Ctrl + K - N 	Ctrl + Num - Ctrl +? Shift + u2013
    //em dash 	? 	U + 2014 	em dash & mdash; 	&#x2014;&#8212; --- Alt + 0151[c]? Opt +? Shift + - 	Compose-- - Ctrl + K - M 	Ctrl + Alt + Num - Ctrl +? Shift + u2014
    //horizontal bar 	Å\ 	U + 2015 	horizontal bar & horbar; 	&#x2015;&#8213; Ctrl + K - 3 		Ctrl +? Shift + u2015
    //swung dash 	? 	U + 2053

    //https://en.wikipedia.org/wiki/Quotation_mark
    //Åg 	U + 201C 	left double quotation mark & ldquo; Double curved quote, left
    //Åh 	U + 201D 	right double quotation mark & rdquo; Double curved quote, right

    //https://en.wikipedia.org/wiki/Euro_sign
    //	U+20AC  EURO SIGN 
    //	U+20A0  EURO - CURRENCY SIGN


    if (selectedString.match(/^[0-9\s\t\w!"\u201C\u201D#\$%&'\u2018\u2019\(\)\*\+,-\u2012\u2013\u2014\u2015\u2053\u20A0\u20AC\./\:;<\=>\?\[\]\^`\{\|\}~]+$/)) {
        //Speech in english
        debuglog('Latin script');
        lang = 1;
    } else {
        //Speech in default language.
        debuglog('NOT Latin script');
    }

    debuglog("isLatinScript() returns:");
    debuglog(lang);

    return lang;
}

function getMsgs(lang) {
    debuglog("getMsgs()");
    debuglog("parameter:");
    debuglog(lang)

//  var msgs = ["LinkDictionary starts reading!\n\n", "\n\nLinkDictionary stops reading!"];
    var msgs = ["", "\n\nLinkDictionary stops reading!"];
    if (lang == 0) {
//      msgs = ["LinkDictionary yomiage kaishi!\n\n", "\n\nLinkDictionary yomiage shuuryou!"];
        msgs = ["", "\n\nLinkDictionary yomiage shuuryou!"];
    }
    debuglog("getMsgs()");
    debuglog("returns: ");
    debuglog(msgs);
    return msgs;
}



function getVoiceIndex(voices) {
    debuglog("getVoiceIndex()");
    debuglog("parameter:")
    debuglog(voices);

    var primaryEn = "en-UK";
    var langvoices = [0, 0];

    for (var i = 0; i < voices.length; i++) {
        debuglog(voices[i].name + ' (' + voices[i].lang + ') isDefault ' + voices[i].default);
        if (voices[i].default) {
            debuglog('default voice is found');
            langvoices[0] = i;
        }
        //en-UK > top of English voice 
        if (voices[i].lang == primaryEn) {
            debuglog('English(UK) voice is found');
            langvoices[1] = i;
        } else if (voices[i].lang.match(/en-+/)) {
            debuglog('English voice is found');
            langvoices[1] = langvoices[1] == 0 ? i : langvoices[1] 
        }
    }
    debuglog("getVoiceIndex()");
    debuglog("returns:");
    debuglog(langvoices);
    return langvoices;
}

function letsSpeech() {
    debuglog("letsSpeech");
    debuglog("letsSpeech return: new Promise");
    return new Promise(function (resolve, reject) {
        var synth = window.speechSynthesis;
        var voices = synth.getVoices();
        resolve(voices);
    })
}

function menuRST(info) {
    debuglog("menuRST");
    debuglog(info.selectionText);

    if (typeof speechSynthesis === 'undefined') {
        debuglog('Web speech API is not supported.');
        return;
    }

    //Amaging! How easy it is to talk!

    selectedString = info.selectionText;
    debuglog(selectedString);

    /*
    var pitchValue = 1; //min 0 max 2 step 0.1
    var rateValue = 1; //min 0.5 max 2 step 0.1
    */

    //Temporarily,current code supports not Latin script user. I will search how to get language of sentence.
    var lang = 0;
    lang = isLatinScript(selectedString);
    msgs = getMsgs(lang);

    var defaultvoice = 0;
    letsSpeech().then(function (voices) {
        var langvoices = getVoiceIndex(voices);
        var utterance = new SpeechSynthesisUtterance(msgs[0] + selectedString + msgs[1]);

        utterance.voice = voices[langvoices[lang]];
        speechSynthesis.speak(utterance);

    });
}

function menuDICT(info) {
    debuglog("menuRST");
    debuglog(info.selectionText);

    const defaultUrlIdx = 0

    //sample url list [en-uk,en-us,es-es,zh-hans,zh-hant,ja-jp]
    const urllist = ["https://www.xxxxxxxx.com/definition/english/%word%%qwtr%",
        "https://www.xxxxxxx.com/dictionary/%word%",
        "https://dictionary.xxxxxxxx.org/es/diccionario/ingles-espanol/%word%",
        "https://dictionary.xxxxxxxx.org/zhs/%E8%AF%8D%E5%85%B8/%E8%8B%B1%E8%AF%AD-%E6%B1%89%E8%AF%AD-%E7%B9%81%E4%BD%93/%word%%qwtr%",
        "https://dictionary.xxxxxxx.org/zht/%E8%A9%9E%E5%85%B8/%E8%8B%B1%E8%AA%9E-%E6%BC%A2%E8%AA%9E-%E7%B9%81%E9%AB%94/%word%%qwtr%",
        "https://ejje.xxxxxxxx.jp/content/%word%%qwtr%"]

    //I want to get locale but navigator.language returns no value.
    var urlIndex = defaultUrlIdx

    var selectedString = info.selectionText.trim().toLowerCase()
    //selectedString  = selectedString.replace(/[\u2012\u2013\u2014\u2015\u2053]/g, "-");

    //Alphabet and symbol of Latin script only
    var queryString = "";

    if (urllist[urlIndex].indexOf('%qwtr%') >= 0) {
        selectedStringHasQuote = selectedString.replace(/['\u2018\u2019]/g, "-");
        if (selectedString != selectedStringHasQuote) {
            console.log('selectedstring has quote:');
            selectedString = selectedStringHasQuote;
            queryString = "?q=" + selectedString.replace(/[\u2018\u2019]/g, "'");
            console.log(selectedString + queryString);
        }
    }

    if (selectedString.match(/^[A-Za-z0-9'!?\-\/\.]+$/)) {
        var urlstring = urllist[urlIndex].replace('%word%', selectedString).replace('%qwtr%', queryString);

        //open dictionary!
        browser.windows.create({
            url: urlstring});
        var win = window.open(urlstring, "linkdictionary", false);
    }


}

browser.menus.onClicked.addListener(function (info, tab) {

    switch (info.menuItemId) {
        case "menuRST":
            menuRST(info);
            break;
        case "menuDICT":
            menuDICT(info);
            break;
        case "menuTST":
            test_js();
            break;
    }   

 });



//test code

function test_js() {

    //console.clear();
    testlog("test_js()");

    var test = {};
    var okcnt = 0;
    class testinfo {
        constructor(isPassed,testname, totalCase, okCase) {
            this.passed = isPassed;
            this.testname = testname;
            this.totalCase = totalCase;
            this.okCase = okCase;
        }
    }

    //test1
    testname = "test of isLatinScript()"; totalCase = 1;
    alphabet = "abcdefghijklmnopqrstuvwxyz";
    testedstrings = "0123456789\t " + alphabet + alphabet.toUpperCase() + "\"\u201C\u201D#\$%&'\u2018\u2019\\*+,-\u2012\u2013\u2014\u2015\u2053\u20A0\u20AC./:;<=>?[]^`{|}~";
    if (1 == isLatinScript(testedstrings)) okcnt += 1;
    test.test1 = new testinfo((totalCase == okcnt), testname, totalCase, okcnt);
    okcnt = 0;

    //test2
    testname = "test of getMsgs()"; totalCase = 4;
    if (getMsgs(0)[0] == "LinkDictionary yomiage kaishi!\n\n") okcnt += 1;
    if (getMsgs(0)[1] == "\n\nLinkDictionary yomiage shuuryou!") okcnt += 1;
    if (getMsgs(1)[0] == "LinkDictionary starts reading!\n\n") okcnt += 1;
    if (getMsgs(1)[1] == "\n\nLinkDictionary stops reading!") okcnt += 1;
    test.test2 = new testinfo((totalCase == okcnt), testname, totalCase, okcnt);
    okcnt = 0;


    //test3
    testname = "test of getVoiceIndex()"; totalCase = 2;
    var en = 1;
    var local = 0;
    class dummyvoices {
        constructor(name, lang, defaultvoice) {
            this.name = name;
            this.lang = lang;
            this.defaultvoice = defaultvoice;
        }
    }
    var voices = [new dummyvoices("voice1", "en-xx", false), new dummyvoices("voice2", "en-UK", false), new dummyvoices("defaultvoice", "xx-xx", true)];
    var langvoices = getVoiceIndex(voices);
    if (2 == langvoices[local] && 1 == langvoices[en]) okcnt += 1;

    voices = [new dummyvoices("voice1", "en-zz", false), new dummyvoices("voice2", "en-xx", false), new dummyvoices("defaultvoice", "xx-xx", false)];
    langvoices = getVoiceIndex(voices);
    if (0 == langvoices[local] && 0 == langvoices[en]) okcnt += 1;

    test.test3 = new testinfo(String(totalCase == okcnt), testname, totalCase, totalCase - okcnt);
    okcnt = 0;

    testlog(test);
    testlog("test_js() end");
}