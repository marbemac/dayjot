<a href="https://dayjot.com"><img src="http://i.imgur.com/8j58X6U.png" align="left" height="50"></a>
### &nbsp; An alternative to [OhLife][ol]

## What is it?

[DayJot][dj] is a simple, private journaling app. It's built to provide many features that were included in the (now defunct) [OhLife][ol] journaling app. The [hosted version][dj] of [DayJot][dj] will be run forever. As long as there is a single user paying $1/month, it will remain online.

## What does it do?

* Customizable email reminder system.
* Reply to reminder to make a post
* Powerful search
* Multiple, beautiful ways to browse your journal.
* Easy [OhLife][ol] importer.
* Easy export of all entries
* Supports Markdown

## How do I use it?

The easiest way is to sign-up at [DayJot][dj] ;).

To get it running on your own machine, here's what you need to know:

#### Stack

* [Ruby 2](https://www.ruby-lang.org/en/)
* [Rails 4](http://rubyonrails.org/)
* [Ember](http://emberjs.com/)
* [Ember-CLI](http://www.ember-cli.com/)
* [PostgreSQL](http://www.postgresql.org/)
* [MailGun](http://mailgun.com/)
* [Delayed Job](https://github.com/collectiveidea/delayed_job)

#### Requirements

1. Install [Node 0.10.x](http://nodejs.org/)
2. `npm install -g ember-cli`
3. `npm install -g bower`
4. Ruby 2.1.4, I recommend installing via [RVM](http://rvm.io)
5. `gem install foreman`
5. [PostgreSQL](http://postgresapp.com)

[This script][dep] provides an easy way to install the above dependencies.

#### Running [DayJot][dj]

After you have cloned this repo, and installed the dependencies above, run this setup script to set up your machine with the necessary dependencies to run and test DayJot:

    % cd rails && ./bin/setup

After setup, you can run the application from the rails directory with:

    % foreman start -f Procfile.local

You should be set to use the app at `http://localhost:3000`. 

Relevant config variables can be found in the rails/config/application.yml file.

Depending on your PostgreSQL setup, you may need to update the DB_USERNAME and DB_PASSWORD properties in `rails/config/application.yml`.

## How do I Contribute?

Gee I'm so glad you asked that, great question!

1. Fork
2. Hack
3. Test (Rails tests can be run via rspec; Tests haven't been setup for Ember)
4. Send a pull request.

The biggest issue right now is that there are very few tests (none for Ember and just a skeleton for Rails). Coincidentally, writing tests is one of the best ways to familiarize oneself with a new codebase.

### Gift for contributors

I would be very grateful to anybody who's up for writing tests for this project. In fact, for anybody who submits a PR with one or more tests (one is fine!), I'll set you up on [DayJot][dj] for free, for life.

## Contact

Please direct any questions, concerns, or general chat to hi@dayjot.com. I'm also available on Twitter at [@marbemac][mb].

## License

[DayJot][dj] is released under the GNU V2 License.

[dj]: https://dayjot.com
[mb]: http://twitter.com/marbemac
[ol]: http://ohlife.com
[dep]: https://github.com/thoughtbot/laptop
