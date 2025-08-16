{
  "targets": [
    {
      "target_name": "AVSpeechSynthesizer",
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_CPP_EXCEPTIONS" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        ["OS=='mac'", {
          "sources": [
            "src/synthesizer.mm",
            "src/binding.cc"
          ],
          "link_settings": {
            "libraries": [
              "-framework AVFoundation",
              "-framework Foundation"
            ]
          },
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.14",
            "OTHER_CPLUSPLUSFLAGS": [
              "-std=c++17",
              "-stdlib=libc++"
            ]
          }
        }]
      ]
    }
  ]
}
