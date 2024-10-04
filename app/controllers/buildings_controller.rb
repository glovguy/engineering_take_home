class BuildingsController < ApplicationController
  skip_forgery_protection # get rid of csrf errors
  before_action :set_building, only: %i[ show edit update destroy ]

  def index
    # in a real app I would likely use a pagination gem
    page = params[:page].to_i || 1
    per_page = 10
    @buildings = Building.order(id: :desc).offset((page - 1) * per_page).limit(per_page)
    respond_to do |format|
      format.json do
        buildings_hashes = @buildings.map do |building|
          cfvs = building.custom_field_values
          cf_hash = {}
          cfvs.each { |cfv| cf_hash[cfv.custom_field.name] = cfv.value }
          {
            id: building.id,
            client_name: building.client.name,
            address: building.address,
            zipcode: building.zipcode,
            state_code: building.state_code,
            **cf_hash
          }
        end
        render json: { status: :success, buildings: buildings_hashes }
      end
      format.html 
    end
  end

  # GET /buildings/1 or /buildings/1.json
  def show
  end

  # GET /buildings/new
  def new
    @building = Building.new
  end

  # GET /buildings/1/edit
  def edit
  end

  # POST /buildings or /buildings.json
  def create
    @client = Client.find_by(name: building_create_params[:client_name])
    ActiveRecord::Base.transaction do
      @building = Building.new({
        address: building_create_params[:address],
        state_code: building_create_params[:state_code],
        zipcode: building_create_params[:zipcode],
        client_id: @client.id
      })
      @building.save
      building_create_params.except(:address, :state_code, :zipcode, :client_name).each do |name, value|
        cf = @client.custom_fields.where(name: name).take
        cfv = CustomFieldValue.new({
          custom_field_id: cf.id,
          building_id: @building.id,
          value: value
        })
        cfv.save
      end

    end
    if @building.persisted?
      render json: { status: :success, building: @building }
    else
      render json: { errors: @building.errors, status: :unprocessable_entity }
    end
  end

  # PATCH/PUT /buildings/1 or /buildings/1.json
  def update
    if @building.update_with_custom_fields(building_params)
      render json: { status: :success }
    else
      render json: @building.errors, status: :unprocessable_entity
    end
  end

  # DELETE /buildings/1 or /buildings/1.json
  def destroy
    @building.destroy!

    respond_to do |format|
      format.html { redirect_to buildings_path, status: :see_other, notice: "Building was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_building
      @building = Building.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def building_params
      params.require(:building).permit!.except(:id, :client_name)
    end

    def building_create_params
      params.require(:building).permit!.except(:id)
    end
end
