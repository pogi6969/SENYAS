import UIKit
import WebKit

/* SENYAS in a WKWebView. The page is the same app/ the website serves. It opens from the website
   over HTTPS, so the camera works and the service worker keeps an offline copy (the site is an
   app-bound domain); with no signal on first start it opens the copy bundled in the app. */
final class SenyasViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    private static let site = URL(string: "https://pogi6969.github.io/SENYAS/app/")!
    private var usedBundle = false

    private let web: WKWebView = {
        let config = WKWebViewConfiguration()
        config.applicationNameForUserAgent = "SENYAS-App/iOS"
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.limitsNavigationsToAppBoundDomains = true
        let view = WKWebView(frame: .zero, configuration: config)
        view.translatesAutoresizingMaskIntoConstraints = false
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 0.043, green: 0.071, blue: 0.125, alpha: 1)
        return view
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.043, green: 0.071, blue: 0.125, alpha: 1)
        view.addSubview(web)
        NSLayoutConstraint.activate([
            web.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            web.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            web.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        web.navigationDelegate = self
        web.uiDelegate = self
        web.load(URLRequest(url: Self.site, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 12))
    }

    private func openBundled() {
        guard !usedBundle, let page = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "app") else { return }
        usedBundle = true
        web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent().deletingLastPathComponent())
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { openBundled() }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { openBundled() }

    /* Links that leave the app open outside it. */
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { return decisionHandler(.allow) }
        if url.isFileURL || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" ||
            (url.host == Self.site.host && url.path.hasPrefix("/SENYAS/app")) || action.targetFrame?.isMainFrame == false {
            return decisionHandler(.allow)
        }
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }

    /* target="_blank" and window.open */
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url { UIApplication.shared.open(url) }
        return nil
    }

    /* Camera and microphone: iOS asks once with the reasons in Info.plist. */
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.prompt)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }
}
