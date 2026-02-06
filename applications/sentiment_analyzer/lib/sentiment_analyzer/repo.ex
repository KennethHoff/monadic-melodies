defmodule SentimentAnalyzer.Repo do
  use Ecto.Repo,
    otp_app: :sentiment_analyzer,
    adapter: Ecto.Adapters.Postgres
end
