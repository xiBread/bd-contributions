# Uploading a Custom Theme

The only requirement is a GitHub account. If you don't have one, you can create one [here](https://github.com/join).

1. Navigate to [GitHub Gist](https://gist.github.com/).
2. You can name the file whatever but make sure the extension is `.json`.
3. Input key-value pairs of the elements you want to style.
4. Click `Create secret gist` (or make it public if you want to share it).
5. Click `Raw`, then copy the URL.
6. Pase it in the `Custom Theme` textbox in the plugin settings and you're done.

Example theme:

```json
{
	"additions": "#859900",
	"attributeSelectors": "#cb4b16",
	"attributes": "#b58900",
	"background": "#282c34",
	"bold": null,
	"builtIns": "#dc322f",
	"bulletPoints": "#cb4b16",
	"classSelectors": "#268bd2",
	"classes": "#b58900",
	"codeblocks": null,
	"comments": "#586e75",
	"deletions": "#dc322f",
	"documentationTags": "#2aa198",
	"foreground": "#839496",
	"headings": "#268bd2",
	"hyperlinks": "#cb4b16",
	"idSelectors": "#268bd2",
	"italics": null,
	"keywords": "#859900",
	"lineNumbers": null,
	"literals": "#2aa198",
	"meta": "#cb4b16",
	"metaStrings": "#2aa198",
	"metaKeywords": "#cb4b16",
	"names": "#268bd2",
	"numbers": "#2aa198",
	"operators": null,
	"parameters": null,
	"pseudoSelectors": "#cb4b16",
	"punctuation": null,
	"quotes": "#586e75",
	"regularExpressions": "#2aa198",
	"sections": "#268bd2",
	"stringInterpolation": "#cb4b16",
	"strings": "#2aa198",
	"symbols": "#cb4b16",
	"tags": null,
	"tagSelectors": "#859900",
	"titles": "#268bd2",
	"types": "#b58900",
	"unspecifiedAttributes": "#b58900",
	"variables": "#b58900",
}
```
