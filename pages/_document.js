import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // Useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      })

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx)
    const cookieTheme = ctx.req?.cookies?.theme ?? null

    return { ...initialProps, cookieTheme }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body className={this.props.cookieTheme}>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function () {
                function getCookie(cname) {
                  let name = cname + "=";
                  let decodedCookie = decodeURIComponent(document.cookie);
                  let ca = decodedCookie.split(';');
                  for(let i = 0; i <ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                      c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                      return c.substring(name.length, c.length);
                    }
                  }
                  return "";
                }
                function setTheme(newTheme) {
                  document.body.className = newTheme;
                  window.__theme = newTheme;
                  window.__onThemeChange(newTheme);
                }
                window.__onThemeChange = function () {};
                window.__setPreferredTheme = function (newTheme) {
                  setTheme(newTheme);
                  try {
                    document.cookie = "theme=" + JSON.stringify(window.__theme);
                  } catch (err) {}
                };
                let preferredTheme;
                try {
                  preferredTheme = JSON.parse(getCookie("theme"));
                } catch (err) {}
                const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
                if (!preferredTheme) {
                  darkQuery.addListener(function (event) {
                    window.__setPreferredTheme(event.matches ? "dark" : "light");
                  });
                  preferredTheme = darkQuery.matches ? "dark" : "light";
                  window.__setPreferredTheme(preferredTheme);
                }
                setTheme(preferredTheme);
              })();
            `
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument