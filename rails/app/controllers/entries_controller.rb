class EntriesController < ApplicationController
  before_action :authenticate_user!, except: [:handle_email]
  before_action :set_entry, only: [:show, :update, :destroy]

  def index
    @entries = current_user.entries

    if params[:search].present?
      @entries = current_user.entries.search_by_body(params[:search])
    end

    if params[:when].present?
      @entries = @entries.where("to_char(entry_date,'YYYY-MM') = ?", params[:when])
    end

    page = params[:page].present? ? params[:page] : 1
    @entries = @entries.page(page).per(10)

    render json: @entries.order('entry_date DESC')
  end

  def show
    unless @entry
      entry_date = Time.now.strftime('%Y-%m-%d')
      @entry = Entry.new(entry_date: entry_date, user_id: current_user.id)
    end
    meta = { current_entry: @entry.entry_date, prev_entry: @entry.prev_entry, random_entry: @entry.random_entry, next_entry: @entry.next_entry }

    if @entry.persisted?
      render json: { entry: @entry.as_json, meta: meta }
    else
      render json: { meta: meta }, status: 404
    end
  end

  def create
    @entry = current_user.entries.new(entry_params)
    if @entry.save
      render json: @entry
    else
      render json: { errors: @entry.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @entry.update(entry_params)
    render json: @entry
  end

  def destroy
    @entry.destroy
    render json: @entry
  end

  def destroy_all
    current_user.entries.delete_all
    render json: {}
  end

  def export
    if current_user.can_export?
      UserMailer.delay.export_entries(current_user.id)
      render json: {}
    else
      render json: { error: 'You may only export your entries once every 24 hours.' }, status: 400
    end
  end

  # Handles incoming emails from Mailchimp
  def handle_email
    token = params['recipient'].split('@')[0]
    user = User.where(email_key: token).first

    # TODO: Notify the user that they couldn't be found..
    unless user
      render json: { error: "User not found for recipient #{params['recipient']} and token #{token}." }
      return
    end

    # Parse out the entry date from the email
    # If not found, use today's date
    entry_date_regex = /Reply\ with\ entry\ for\ date:\ ([\d]{4}-[\d]{2}-[\d]{2})\./
    m = params['body-plain'].match(entry_date_regex)
    if m && m.captures[0]
      entry_date = m.captures[0]
    else
      entry_date = Time.now.in_time_zone(user.time_zone).strftime('%Y-%m-%d')
    end

    # Find or create the entry
    entry = user.entries.where(entry_date: entry_date).first
    unless entry
      entry = Entry.new(user_id: user.id, entry_date: entry_date, source: 'email')
    end

    # If the entry already exists, append the new content onto the body
    if entry.persisted?
      entry.body = entry.body + '\n\n' + params['stripped-text']
    else
      entry.body = params['stripped-text']
    end

    if entry.save
      render json: entry
    else
      render json: { errors: entry.errors.full_messages }
    end
  end

  private

  def set_entry
    # if the id is in the format YYYY-MM-DD, search on entry date, else search by id
    if /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/.match(params[:id])
      @entry = current_user.entries.where(entry_date: params[:id]).first
    else
      @entry = current_user.entries.find(params[:id])
    end
  end

  def entry_params
    params.require(:entry).permit(:body, :entry_date)
  end
end
