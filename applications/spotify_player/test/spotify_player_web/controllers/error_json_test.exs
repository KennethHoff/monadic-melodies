defmodule SpotifyPlayerWeb.ErrorJSONTest do
  use SpotifyPlayerWeb.ConnCase, async: true

  test "renders 404" do
    assert SpotifyPlayerWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert SpotifyPlayerWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
