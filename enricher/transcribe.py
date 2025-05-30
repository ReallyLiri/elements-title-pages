import base64

from tools import openai_client, write_csv

path = "/Users/liri/Downloads/"

entries = []

def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

for i in range(1, 38):
    try:
        image_data = encode_image(f"{path}a{i}.JPEG")
        print(f"Processing image {i}")
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Please transcribe the text in this image. Keep the original formatting, whitespace, line breaks (even at the middle of a sentence) and punctuation as much as possible. Ignore handwriting, library markings and printer's device or other illustrations. Only return the transcription of the text in the image."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_data}"
                            },
                        },
                    ],
                }
            ],
        )
        if len(response.choices) != 1:
            print("!!! Unexpected response from OpenAI", response)
        if response.choices[0].finish_reason != 'stop':
            print("!!! OpenAI did not finish processing the request", response)
        entries.append({
            "transcription": response.choices[0].message.content.strip()
        })
    except Exception as e:
        print("!!! Error querying OpenAI", e)

write_csv(entries, f"transcriptions.csv", ["transcription"])
