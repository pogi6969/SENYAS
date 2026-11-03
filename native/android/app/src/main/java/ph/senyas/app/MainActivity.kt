package ph.senyas.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.util.Locale

/* SENYAS in a WebView. The page is the same app/index.html the website serves, bundled with the
   hand-tracking files and served from https://appassets.androidplatform.net so the camera, storage
   and WebAssembly behave as on the web. The page reaches the phone's own voice through SenyasNative:
   speak() uses Android text-to-speech, listen() uses Android speech recognition. */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var recognizer: SpeechRecognizer? = null
    private var pendingWeb: PermissionRequest? = null
    private var pendingListen: String? = null
    private var fileCallback: ValueCallback<Array<Uri>>? = null

    private val askCamera = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        pendingWeb?.let { req -> if (ok) req.grant(req.resources) else req.deny() }
        pendingWeb = null
    }
    private val askMic = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        val lang = pendingListen
        pendingListen = null
        if (ok && lang != null) startListening(lang) else heard(null, true)
    }
    private val pickFile = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        fileCallback?.onReceiveValue(if (uri != null) arrayOf(uri) else null)
        fileCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val root = findViewById<android.view.View>(R.id.root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        tts = TextToSpeech(this) { status -> ttsReady = status == TextToSpeech.SUCCESS }

        web = findViewById(R.id.web)
        val assets = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            userAgentString = "$userAgentString SENYAS-App/Android"
        }
        web.addJavascriptInterface(Bridge(), "SenyasNative")

        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                val res = assets.shouldInterceptRequest(request.url) ?: return null
                val path = request.url.path ?: ""
                when {
                    path.endsWith(".wasm") -> res.mimeType = "application/wasm"
                    path.endsWith(".mjs") -> res.mimeType = "text/javascript"
                    path.endsWith(".task") -> res.mimeType = "application/octet-stream"
                }
                return res
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == APP_HOST && request.url.path?.startsWith("/assets/app/") == true) return false
                try { startActivity(Intent(Intent.ACTION_VIEW, request.url)) } catch (_: ActivityNotFoundException) {}
                return true
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE !in request.resources) { request.deny(); return@runOnUiThread }
                    if (has(Manifest.permission.CAMERA)) request.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
                    else { pendingWeb = request; askCamera.launch(Manifest.permission.CAMERA) }
                }
            }

            override fun onShowFileChooser(view: WebView, callback: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
                fileCallback?.onReceiveValue(null)
                fileCallback = callback
                pickFile.launch("image/*")
                return true
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { if (web.canGoBack()) web.goBack() else finish() }
        })

        if (savedInstanceState == null) web.loadUrl(START_URL) else web.restoreState(savedInstanceState)
    }

    private fun has(p: String) = ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED

    private fun heard(text: String?, final: Boolean) {
        val arg = if (text == null) "null" else JSONObject.quote(text)
        runOnUiThread { web.evaluateJavascript("window.senyasHeard && window.senyasHeard($arg, $final)", null) }
    }

    private fun startListening(lang: String) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { heard(null, true); return }
        recognizer?.destroy()
        recognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onResults(b: Bundle) { heard(b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull(), true) }
                override fun onPartialResults(b: Bundle) { b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.let { heard(it, false) } }
                override fun onError(error: Int) { heard(null, true) }
                override fun onReadyForSpeech(p: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(v: Float) {}
                override fun onBufferReceived(b: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onEvent(t: Int, b: Bundle?) {}
            })
            startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            })
        }
    }

    inner class Bridge {
        @JavascriptInterface
        fun speak(text: String, lang: String, rate: Double, flush: Boolean) {
            val t = tts ?: return
            if (!ttsReady) return
            val loc = Locale.forLanguageTag(lang)
            val ok = t.isLanguageAvailable(loc) >= TextToSpeech.LANG_AVAILABLE
            t.language = if (ok) loc else if (lang.startsWith("en")) Locale.US else Locale.forLanguageTag("fil-PH")
            t.setSpeechRate(rate.toFloat())
            t.speak(text, if (flush) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD, null, "senyas")
        }

        @JavascriptInterface
        fun listen(lang: String) {
            runOnUiThread {
                if (has(Manifest.permission.RECORD_AUDIO)) startListening(lang)
                else { pendingListen = lang; askMic.launch(Manifest.permission.RECORD_AUDIO) }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onDestroy() {
        recognizer?.destroy()
        tts?.shutdown()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val APP_HOST = "appassets.androidplatform.net"
        private const val START_URL = "https://$APP_HOST/assets/app/index.html"
    }
}
