import { Component, h, State } from '@stencil/core';
import { getUrl } from '../../helpers/utils';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {
  @State() page: any = null;

  @State() output: string = '';
  @State() renderCount: number = 0;

  inputTemplate: string;
  outputTemplate: string;
  maps: string;

  source: string;
  settings: any = {};

  showSauce: boolean = false;

  constructor() {
    //this.loadSettings();
  }

  async componentWillLoad() {
  }

  componentDidLoad() {
    this.readFile("/assets/data/dedual2.txt");
  }

  mapToDiscordText() {
    var keys = {};
    var lineKeys = [];

    var inputTempLines = this.inputTemplate.split('\n');
    var sourceIndex = 0;
    var sourceLines = this.source.split('\n');

    var inputTempLinesIndex = 0;
    var repeatTemp = false;

    var maps = {};
    var mapLines = this.maps.split('\n');
    for (var i = 0; i < mapLines.length; i++) {
      var eqIndex = mapLines[i].indexOf('=');
      maps[mapLines[i].substr(0, eqIndex)] = mapLines[i].substr(eqIndex + 1).trim();
    }

    while (sourceIndex < sourceLines.length && inputTempLinesIndex < inputTempLines.length) {
      var inputSource = inputTempLines[inputTempLinesIndex].trim();
      if (inputSource.length > 0 && inputSource[0] === '*') {
        repeatTemp = true;
        inputSource = inputSource.trim().substr(1, inputSource.trim().length - 2);
      }

      var itLine = ("[]" + inputSource + "[]").split(/[\[\]]/);
      var key = null;
      var remSource = sourceLines[sourceIndex];
      var validLines = true;
      for (var j = 2; j < itLine.length - 2; j++) {
        var isMeta = j % 2 == 1;
        if (isMeta) {
          key = itLine[j];
        }
        else {
          var seg = itLine[j];
          if (seg === '\\t') {
            seg = '\t';
          }
          var searchIndex =
            seg.length === 0 ?
              (j === 2 ? 0 : (j === itLine.length - 3 ? remSource.length : -1)) :
              remSource.indexOf(seg);
          if (searchIndex > -1) {
            if (key !== null && key.length > 0) {
              var value = remSource.substr(0, searchIndex);
              if (value.length === 0) {
                //bad line?
                validLines = false;
                break;
              }

              keys[key] = value;
              key = null;
            }
            remSource = remSource.substr(searchIndex + seg.length);
          }
          else {
            //bad line?
            validLines = false;
            break;
          }
        }
      }

      ++sourceIndex;
      if (!repeatTemp) {
        inputTempLinesIndex++;
      }
      else {
        if (validLines) {
          lineKeys.push(Object.assign({}, keys));
        }
      }
    }

    // now output
    var outLines = this.outputTemplate.split('\n');
    var outIndex = 0;
    var keySet = keys;
    var lineKeyIndex = 0;
    repeatTemp = false;
    var repeatStart = 0;
    var outMsg = '';
    var repeatingStart = false;

    while (outIndex < outLines.length && lineKeyIndex < lineKeys.length) {
      var outLine = outLines[outIndex].trim();
      if (outLine.length > 0 && outLine[0] === '{') {
        //command
        if (outLine.startsWith('{sort:')) {
          var sortKey = outLine.substr(6, outLine.length - 7);
          lineKeys.sort((a, b) => (a[sortKey] > b[sortKey]) ? 1 : -1);
        }

        outIndex++;
        continue;
      }

      var outParts = ("[]" + outLine + "[]").split(/[\[\]]/);
      for (var j = 2; j < outParts.length - 2; j++) {
        var isMeta = j % 2 == 1;
        if (isMeta) {
          if (!repeatingStart) {
            key = outParts[j];
            if (key.indexOf(':') > -1) {
              if (key.indexOf('map:') > -1) {
                key = keySet[key.substr(4)];
                if (maps.hasOwnProperty(key)) {
                  outMsg += maps[key];
                }
                else {
                  for (var keyx in maps) {
                    var index = keyx.indexOf('*');
                    if (index > -1) {
                      var keyxx = keyx.substr(0, index);
                      if (key.indexOf(keyxx) === 0) {
                        var value = maps[keyx];
                        outMsg += value;
                      }
                    }
                  }
                }
                continue;
              }
            }
            outMsg += keySet[key];
          }
        }
        else {
          if (outParts[j] === '*') {

            if (repeatingStart) {
              repeatingStart = false;
              break;
            }

            if (repeatTemp) {
              outIndex = repeatStart - 1;
              lineKeyIndex++;
              keySet = lineKeys[lineKeyIndex];
              repeatingStart = true;
              break;
            }
            else {
              repeatStart = outIndex;
              repeatTemp = true;
              keySet = lineKeys[lineKeyIndex];
              break;
            }
          }
          else if (!repeatingStart) {
            outMsg += outParts[j];
          }
        }
      }

      outIndex++;
      outMsg += '\n';
    }

    this.output = outMsg;
    ++this.renderCount;
  }

  async readFile(filename: any) {
    var text = await getUrl(filename, false);
    var lines = text.split('\n');
    var header = '';
    var map = '';
    var intemp = '';
    var outtemp = '';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf('[[') == 0) {
        header = lines[i].trim();
        continue;
      }

      if (line.trim().length === 0) {
        continue;
      }

      if (header === '[[map]]') {
        map += line + '\n';
      } else if (header === '[[inputtemplate]]') {
        intemp += line + '\n';
      } else if (header === '[[outputtemplate]]') {
        outtemp += line + '\n';
      }
    }

    this.inputTemplate = intemp.substr(0, intemp.length - 1).trim();
    this.maps = map.substr(0, map.length - 1).trim();
    this.outputTemplate = outtemp.substr(0, outtemp.length - 1).trim();
    ++this.renderCount;
  }

  loadSettings() {
    return;
    // try {
    //   this.settings = JSON.parse(localStorage.getItem('settings'));
    //   if (this.settings === null) {
    //     this.settings = {};
    //   }

    //   this.inputTemplate = this.settings['inputTemplate'];
    //   this.maps = this.settings['maps'];
    //   this.outputTemplate = this.settings['outputTemplate'];

    // } catch {
    //   this.settings = {};
    // }

    // var ionApp = document.getElementsByTagName('ion-app');
    // if (ionApp && ionApp.length > 0) {
    //   toggleClass(ionApp[0] as Element, 'nightmode', this.settings.darkMode);
    //   toggleClass(ionApp[0] as Element, 'daymode', !this.settings.darkMode);
    // }
  }

  saveSettings() {
    return;
    // try {
    //   this.settings['inputTemplate'] = this.inputTemplate;
    //   this.settings['maps'] = this.maps;
    //   this.settings['outputTemplate'] = this.outputTemplate;

    //   localStorage.setItem('settings', JSON.stringify(this.settings));
    // } catch {
    //   console.log('could not save settings');
    // }
  }

  render() {
    var onChange = (e, fromMain: boolean = true) => {
      if (fromMain) {
        this.source = (e.target as any).value;
      }

      this.mapToDiscordText();
    };

    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>DisText - Text Manipulator</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">

        <img src='../assets/images/pastehere.png'></img>

        <ion-card>
          {/* <ion-label class='edit-label'>source:</ion-label> */}
          <ion-textarea class='edit-area editable' rows={6} id='query'
            value={this.source}
            onInput={onChange}></ion-textarea>
        </ion-card>

        <img src='../assets/images/copythis.png'></img>

        <ion-card>
          <ion-label class='edit-label'></ion-label>
          <ion-textarea class='edit-area editable' rows={20} id='query'
            value={this.output}></ion-textarea>
        </ion-card>

        <ion-button onClick={() => { this.showSauce = !this.showSauce; ++this.renderCount; }}><ion-label>...click here to show the secret sauce...</ion-label></ion-button>

        {this.showSauce ? (
          <div>
            <ion-card>
              <ion-label class='edit-label'>maps:</ion-label>
              <ion-textarea class='edit-area editable' rows={10} id='query'
                value={this.maps}
                onInput={e => { this.maps = (e.target as any).value; this.saveSettings(); onChange(e, false); }}></ion-textarea>
            </ion-card>

            <ion-card>
              <ion-label class='edit-label'>input template:</ion-label>
              <ion-textarea class='edit-area editable' rows={10} id='query'
                value={this.inputTemplate}
                onInput={e => { this.inputTemplate = (e.target as any).value; this.saveSettings(); onChange(e, false); }}></ion-textarea>
            </ion-card>

            <ion-card>
              <ion-label class='edit-label'>output template:</ion-label>
              <ion-textarea class='edit-area editable' rows={10} id='query'
                value={this.outputTemplate}
                onInput={e => { this.outputTemplate = (e.target as any).value; this.saveSettings(); onChange(e, false); }}></ion-textarea>
            </ion-card>
          </div>
        ) : ""}

      </ion-content>
    ];
  }
}
