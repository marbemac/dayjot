import Ember from "ember";

export default Ember.Controller.extend({
  importText: null,
  entryCount: null,
  done: false,
  successCount: 0,
  processing: false,
  processingText: null,
  processingCount: 0,
  errors: null,
  
  actions: {
    resetImport: function() {
      this.set('importText', "");
      this.set('entryCount', null);
      this.set('successCount', 0);
      this.set('processingText', null);
      this.set('processingCount', 0);
      this.set('errors', null);      
      this.set('done', false);
      this.set('processing', false);      
    },
    startImport: function() {
      this.set('processingText', "Processing import text..");
      this.set('processing', true);

      var lines = this.get('importText').split('\n'),
          line = null,
          entries = [],
          currentEntry = null,
          entryDate = null,
          i = 0;

      for (i = 0; i < lines.length; i++) {
        line = lines[i].trim();
        
        // just a newline
        if (!line) { 
          // if we have an entry right now, add the newline to it
          if (currentEntry) {
            currentEntry.text = currentEntry.text + "\n";
          }
          continue;  
        }
        
        entryDate = moment(line, 'YYYY-MM-DD', true);
        if (entryDate.isValid()) {
          if (currentEntry) {
            currentEntry.text = $.trim(currentEntry.text);
            entries.push(currentEntry);
          }

          currentEntry = {
            date: entryDate.utc().toDate(),
            text: ""
          };

          // DailyDiary text exports are formatted as such:
          // 2015-01-01
          // 22:00
          //
          // Rest of entry...
          //
          // So if the next line is a time, skip it to support DailyDiary exports.
          if (moment(lines[i+1], 'HH:mm', true).isValid()) {
            i++;
          }
        } else {
          if (currentEntry) {
            currentEntry.text = currentEntry.text + line + "\n";
          }
        }
      }

      // ran out of lines, need to handle the last entry
      // this must happen even if the last line was a newline
      if (currentEntry) {
        currentEntry.text = $.trim(currentEntry.text);
        entries.push(currentEntry);
      }

      this.set('entryCount', entries.length);
      var entry = null,
          entryObjects = [];
      for (i = 0; i < entries.length; i++) {
        entry = this.store.createRecord('entry', {
                  entryDate: entries[i].date,
                  body: entries[i].text
                });
        entryObjects.push(entry);
      }      

      this.saveEntries(entryObjects);
    }
  },

  saveEntries: function(entries) {
      var _this = this,
          currentEntry = entries.shift();
      if (currentEntry) {
        currentEntry.save().then(function() {
          _this.set('successCount', _this.get('successCount')+1);
        }, function(error) {
          var errors = _this.get('errors');
          errors = errors ? errors : '';
          errors += "<p class='d-negative'>> "+moment(currentEntry.get('entryDate')).format('YYYY-MM-DD') + ": "+error.error+"</p>";
          _this.set('errors', errors);
        }).finally(function(){
          _this.set('processingCount', _this.get('processingCount')+1);
          _this.saveEntries(entries);
        });
      } else {
        this.set('done', true);
        var user = this.get('session.currentUser');
        user.refresh();
      }
    }
});
