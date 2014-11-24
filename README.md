<a href="https://dayjot.com"><img src="http://i.imgur.com/8j58X6U.png" align="left" height="50"></a>
### &nbsp; An alternative to OhLife https://dayjot.com.

## What is it?

DayJot is a simple, private journaling app. It's built to provide many features that were included in the (now defunct) OhLife journaling app. The hosted version of DayJot will be run forever, and can be found at https://dayjot.com. As long as there is a single user paying $1/month, it will remain online.

## What does it do?

* It __emails you reminders__, and allows you to customize exactly when these are sent.
* It __accepts posts by email__. Simply reply to a reminder email with your entry and it will be created.
* Included in each reminder email is an old entry, to __remind you of that memory__ from last year, last month, or last week.
* Powerful __search by term and/or month__ makes it easy to find that long lost memory. 
* Enjoy __multiple, beautiful ways to browse__ your journal. Skip to random entries, view by month, and more.
* OhLife importer. __The perfect OhLife replacement__, built to last. Easily import your OhLife entries. 
* 1-Click __export__ of all of your entries.

## How do I use it?

The easiest way is to sign-up at https://dayjot.com ;).

To get it running on your own machine, here's what you need to know:

#### Stack

* Ruby 2 (https://www.ruby-lang.org/en/)
* Rails 4 (http://rubyonrails.org/)
* Ember (http://emberjs.com/)
* Ember-Cli (http://www.ember-cli.com/)
* PostgreSQL (http://www.postgresql.org/)
* Mailgun (http://mailgun.com/)
* Delayed Job (https://github.com/collectiveidea/delayed_job)

#### Requirements

1. Node 0.10.x (http://nodejs.org/)
2. Ember CLI
  * npm install -g ember-cli
3. Bower
  * npm install -g bower
4. Ruby 2.1.4
  * I recommend instally and managing Ruby with RVM (http://rvm.io/). DayJot is setup to use RVM.
5. PostgreSQL
  * Mac users, I recommend http://postgresapp.com.
  * Windows users.. up to you.
  
#### Running DayJot

1 Install the requirements listed above. 
2 Fork this repository, and lone it to your machine.
3 Change into the dayjot/ember directory. Then run:

```
bower install
npm install
```

4 Change into the dayjot/rails directory.
5 Update the DB settings in config/database.yml as appropriate (most likely just the username).
6 Copy config/application.example.yml to config/application.yml, and fill in anything you want (all optional). Then run:

```
bundle install
rake db:create
rake db:migrate
foreman start -f Procfile.local
```

7 Visit http://localhost:3000/ in your browser and you should be all set!

## How do I Contribute?

Gee I'm so glad you asked that, great question! 

1. Fork it.
2. Hack it.
3. Test it. Whoops! There are no tests yet. More on this below.
4. Send a pull request.

The biggest issue right now is that there are no tests (for the Ember or Rails parts of the project). Coincidentally, writing tests is one of the best ways to familiarize oneself with a new codebase. I would be very grateful to anybody who's up for writing tests for this project. In fact, __for anybody who submits a PR with one or more tests (one is fine!), I'll set you up on DayJot.com for free, for life__.

## Contact

Please direct any questions, concerns, or general chat to hi@dayjot.com. I'm also available on Twitter at <a href='https://twitter.com/marbemac'>@marbemac</a>.

## License

DayJot is released under the GNU V2 License.
