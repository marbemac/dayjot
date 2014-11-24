class EnableExtensions < ActiveRecord::Migration
  def up
    enable_extension :hstore
    enable_extension 'uuid-ossp'
  end

  def down
    disable_extension :hstore
    disable_extension 'uuid-ossp'
  end
end
