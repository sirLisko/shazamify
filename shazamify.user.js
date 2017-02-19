// ==UserScript==
// @name          Shazamify
// @description   Shazamify allows you to play your Shazams in Spotify, directly from the browser.
// @author        Luca Lischetti <sirlisko@gmail.com>
// @namespace     http://github.com/sirLisko/shazamify
// @include       https://www.shazam.com/*track/*
// @downloadURL   https://github.com/sirlisko/shazamify/raw/master/shazamify.user.js
// @updateURL     https://github.com/sirlisko/shazamify/raw/master/shazamify.user.js
// @version       0.5.0
// ==/UserScript==

(function () {
  'use strict'

  var urlBase = 'https://api.spotify.com/v1/search?type=track&q='
  var trackApiUrl = 'https://www.shazam.com/discovery/v1/en/GB/web/-/track/'
  var url

  function handleResponse (data) {
    if (data && data.tracks && data.tracks.items && data.tracks.items.length) {
      var button = document.createElement('a')
      button.id = 'shazamify'
      button.href = data.tracks.items[0].uri

      setTimeout(function () {
        document.querySelector('.parts').appendChild(button)
      }, 1000)
    }
  }

  function apiOnLoad (e) {
    var data = e.target
    if (data.status >= 200 && data.status < 400) {
      data = JSON.parse(data.responseText)
      handleResponse(data)
    }
  }

  function searchSpotify (track) {
    var request = new XMLHttpRequest()
    request.open('GET', getUrl(track), true)
    request.onload = apiOnLoad
    request.send()
  }

  function getUrl (track) {
    var query = track.title + ' artist:' + track.subtitle
    return urlBase + encodeURIComponent(query)
  }

  function waitForNewTrack () {
    var waitTrack = setInterval(function () {
      if (url !== location.href) {
        clearInterval(waitTrack)
        getTrack()
      }
    }, 1000)
  }

  function getTrackInfo (e) {
    var data = e.target
    if (data.status >= 200 && data.status < 400) {
      data = JSON.parse(data.responseText)
      searchSpotify(data.heading)
    }
  }

  function getTrack () {
    url = location.href
    var trackId = /.*\/track\/(\d+)/g.exec(location.href)[1]
    var request = new XMLHttpRequest()
    request.open('GET', trackApiUrl + trackId, true)
    request.onload = getTrackInfo
    request.send()
  }

  function attachEvents () {
    document.addEventListener('click', function (e) {
      e.target.getAttribute('href').indexOf('www.shazam.com/track') !== -1 && waitForNewTrack()
    }, false)
  }

  function addCss (cssString) {
    var head = document.getElementsByTagName('head')[0]
    var newCss = document.createElement('style')
    newCss.type = 'text/css'
    newCss.innerHTML = cssString
    head.appendChild(newCss)
  }
  addCss('#shazamify{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAbuElEQVR42u1dCXRb1Zl+enqS7DhxQhZIQggJCUtIwtKUQMrShCUUaFhK00J7aEMpaYfltNOhDDBwjoelBUJLy5ROMyl0aOlMj4n0JMtWvCR12cJSx3pXsrzGliEJzYStJZ0hsSW/+f57382TLcuyLCeOHb9z/vO0vOW+/7///t//KePb+Da+jaXNNBVHiamopaWKs9TMAKVrnXQMHauMb8OM/FpF21inuAiICLleg86R59O1xomU40Yzm5BXC+QNdFyoTfGU1imTX3xTKQ5Z8OKbU4vpt7r3Nk4Y6NxaTuRlLrqXMr6lbQ4TiCmpXan1hyAfU473R7XP6WHnOt1QH/YZzhcB5YA6fG/zGWozoIVAN1zN3rDSFmCLmc7mhXyG8jvdKHjYi3PpGnSt/iaA4JySceLQTO0rhmjGew1tlddQH9GZcysQvQvIT4RanGZ1ByAu9pU7neaWVkBbH2jVsFdwjGLWxDV+LJ2L6yR8hns3iLTVz2Y9uqXhxitD4Ki+4q0WE+OYJ8T2XT8tDLCVX8Ds/qVuONv8EadZ1Q4A0iuanWaggRDKIQHoBnT5wtgPBDiGjhXn0DXoWhoI6TCr2wvMYGymSffSmfrsS/XKVbXxkgI5nrWcMCVjnzDc+knRDVXNa+cHouffrxszjPKmuWZNp8JnMwhCyE8CsQkCLz7jew/AlKBnAV9v6PHy66m4HhHIkdAZ3UvFPUGcRsUMsLPDlbGv/9ObuzfNkeOTFtsYVNQlaqoo8NZPOdkXVjbobMoHNfETSMQAaQRaFyFMIv/wgtZD9xKcBM7hYm6iWR5d+RcQ5qltbXcvkOOlSUTPMDbEk2kT4vWdJcf72alPAvkfVne4zPImxQRhSLZ3QSGDCCoh64gDOIruDcIoCYwJhCGOOffjrU3rH2va/cK01GcZxT6E6ag1bfGks9Nv043Zu7Z2zuAiQogjDcRwmToIIYkxUqAz2ntMGhNNkrIYCBN3m8HoJe/Utt69Tj4HmeT0bKNLV5i23H2j9ZFF5dErK6vaZ0CpctEERaslJCIkIY4OUC394wK4EzTWihYFxsUpZjByUfnL7T88VZrq/BlHwYYZtN51SGnHvvKtQOTs/SQCvIaShE/QTQ8+esBl0php7NVxxSyLLPt4W9N319ki7Ci3xIidaR83awtCDas3bmmdLcSToUBHuHt0wQ2jCnRGXFPIdUywSYGfM8ssj1y+EWLLLZ/5qCbGm23PzAmwJW9se3eiCb+CzzAo7LxF08iLMg3g7iZrcNs7k8yKhmtfaez83ayjkih1iAvR3h85Y2lZZMXu6g7BFT6jgGaWJMaoB532rDBJz1bVoYAoV8drG+9ZwokCHBxlxChaqhuOvZU7uT9xEEpREmKMgSqV/kF6Vt046f2tDbefN+JEkawqiYGBghhOPlA9B+tpNIsw7A+SU+tniz+0iaK4RpgYZ4AYDosYTkGMYwJUU+hGFyeKzk7aV7vzgSUjQhRiTanASWeAdW3OIDjmiOKE+CKdsqaz/t3nZkvz/4g6fWTakjVV3eEgnTHmiZHdmSw4CEVPnv3rMIk9EleHPaUqP/vZyZu2vTtVWFO5mbVjVNG7OS62vTPF3NKwZlNqCOnw6w12zrdDrRSPAjB3MoUYxzZR2IQk+V5VbfPNmqZ1t0ucHdao7cut9y4KRM7ZTx64bni6x4mR6qdwr76bcONnZ+1/pe1HZx6WKHFqrrsssrRKOH5OhEPGiZBOFBcXXYSjUMPVVRJvw5qzp+SSDKFXt8+yAoWunnHuyKTkPT2EI0S4IbpuuV0muYYt7SqTS7oxa1dFs4xPDRcx5HXS068Dc6CWdpxuw8iLLuCovJkixBfseTv+7Mxhs7okZSnTh+QSz2fkP2BJCM20OE3mz2VxQirQb8l0UBL8PCP9HIK0XPwRJ5TGcVUddyA6vPJpWdWSd3WIzIFT2pWUlUwuDREIOTKPDQBxYZUEohrSuVTGI6pNauKATmtvlf2kgxtA/0uwK1UqcR26XpmsVgmrRDwyz2XOPklp2yNgCicp8xiInP7JH5sfPD1vBS8pSgUJlAOnh8lpQJIAEgmMSnEIcQ4gnHLXxaj8mMbz6vjvA5wTw3FvY2Zv9jHnC0DaHwD/5g2r9+K/+0BEgHIffQ5ELnzIZ8yg778Cov+bCuhQEPc6xEU9/o/gnrie89Ngo4r7abgfEVFUmpTFJKHk2MT4DguX4NmqOwqRcbzsFykGkmPI3FHF1s6n6hBRkJALd1AKFOza7Dg0c/1R+l3ZrRtzaoHkXwaMs39QHr3mS7Ddz/M2zjq5NKZMpDx8PhMI13D/lilFKCmdu3mH+yx/WLnaFym+M8DOeros8tkqn1HYqhvK34ONoogOY6NJIkuPpNhM2Hl2NT8uCXsSlNjysyUfvtz8yHzbSMptc0juCEYvvL8mPoNT2vbIs88KEBCzsRDfi3aDMF6dqd/3RbTPB6LKCblGB0R9VDrkLpOpMnJhcSlTTg8w57UQZY+BqyrAVe8GorIiUgEHqYJ7SKzmZU2qAA8l6hI18dlmVeMtDx7iEjxXLkhQ+YzbPqcQF2NUs0SDA1IHo8gSW1onm35j4R49PG1daf3FMzIhuu+SAonkkhKxlEDusxFMHgdQ6fz064prZuSsemXG5rDzahBog27MfAtxqQPVHSTqFHAOlwzkACeGoneENVrQRRHh8uilsb17WVHOfgk9hCh01r5Q3ui2rCF1EIPRksKDL95TGfvm4lSkyYp2fJbIO7KlNNY9aXbS82WqsKcSUj024xxMrH9GReWrOpsNgwHIbNK4TgRRuvk+J7+koIdCKqHm+WZV07o10nrN2TOHDH2WlKFlSprZwQEF5jH18Ox76fzfxOcViIfOP6iZCYbj2kSgurT1JyIwGIx8foXOlKcx2XbLAm/OKWFnruZ/FxG2IrrqeTtQCxgsMWi9BZX7h1qENTLI6j9rJp34RWkYDG5FVIk1a5e5CDFy9pKCp9+zKXIyJel4Os8+f+UhbszVMOivKp90H/BxF1lwMKslYbrJ19EHZwInuKPIFneiuHzqoMUWPYwUV2TH60z4D4MjCFksdHOFE4QsnvSZLkQGseyRKmQuKZH3XMkRPThCSfG21jYeuF5VCr3M+W3omxikh20AZCUKjAMG0RdDUXnj+msGnYOXs9rH1Eer2+lCOfgeGJhI5bpepGtIouCaA870KrahCJbP/GBk+Qo/m/Hlssj56/2ReT+G3H3MF3b9DMQuAwRp7+N7D/ZKUGenBsuiF/ycjguwc35UHr3stpfCylpfpHBFILZiYWnd5ZOz6UqbG7JzDnFfynNN9Ia1B5Bb/3tFs2MQeNIA5JMUQbmv3iD1yKATUJCbNZU7tRydQSi7iAOzptAsiy65rb97BF5TJulh1zk6c9+MAT4eYAtCAbaoGabyxz5WnCxv8kAcFMLC8WAdh4q9Mzvw4yaYodZJEJlADlMhRo77q49NbMc9XsW4niclHYpcdX2FcfVptBwuE8JpP5g1i/J7BVt9vp/N3wsznxMl+4TlSx9esbm3RM0a1X2t+a7ZfnbKX3J0BiUkyabXWQFg1s98xqSL4Igt99Y7bxPL0dQmUoiQwbTCCYgkf0VBhaOLTEzLKlEQLXUkST4LZy0TqHytBx0jItAKxKbGHVAKWVS0OExMKtxHNcmMDTXPxJimf4JzwlhFtQlceOvmHcpZoZDi6Y9zaIJmc0L55DXm3kITQYruzATRuH8GJ3Xf23t+cpLEedbihcrmb6wC1fFghCBXcgiBw6Q/4gASNCBZzAwiwNZOoQwDUamXVCq87oZYEoFCJoKBegqkK0c1LUpsH6/10Pn8OpKYhlhRpfO9QoQCkShWpmEsLqQS1E9xrR1Q2E+QLwLuKe4bXCWdk2kCy3WQuM9eip95BwzBuIEXim2dav6x5TuXSZxn1R9+48TvbGl140EdPUNePAOk6EA4CCKXpNF1DhJyMsWNdAks4wMBXKZAvNb7XAbIWqfrovOs4KZK0IO4FhEIk8caZ1jdiWN+4qvXVvTOmCppi1IlBwWap0/Cs3aEWjLrXMH5btxf6alsm4m8+1fvyGaJOuQNwfpPEIvLi+cJSQD3cjnSBo4CE8d0Ic7FEdZnvWBShG84mPgsf5f7g3QucULmaK7aN2/Skxq/oslTIRaXynOqMeO/KvWKNFKklVa6Symk32BUXEj3DUTFRBywEIKHUYpQMnTdT+ncjNEIGVqwCPKH6riLZkv3sNXESgRIAkFUEQeB3ZOEiPJGEmck5hQZepd7iDprFrdPh845DjpnIn6fgP9VeRyAFLuM5sp7SpFFezs3MsDaFJmXIeKIFbytHMlvAG5SMmyYCK+SYUFEyWL68olEK4nhcL6UQbGn53wDkUXVMm+eN0Gk+MJghW7R4KuQslWATDeIUMzDMpgE7+vGtJifzd7iZyeWorJlAxT1QzAtS7B/xBv23FERvfZ7FQ2X3RmIXLRWN5Y+hN8fRljiQZz7jM4meWGtvexjHogcZX8wRgaDQCo5csFGKQolJ6rYa/hNGyh300V7XEcQxiiuxvgvJ0uxNq4UUDQZKYDyimYSpY5BinatiyZOMLrqTxQJkLjPWABXu++OiTpb2EjBMK4M8+cM5EGkeeoCAojQ03YFjKXVPmPm40F20Tc2M+V8GBAnBd9bNiHfZXSldcdNpmguObZ6WP0exvAbjOEtABJs9hp34iIh/hxdGXUaE1wtCzo4F4BzKIIB6dGI3w9UtjnEhBqc82wKC5Obvs1vtpUUS9xnDCiSlQGZ2IoF+HkTBJDEg0tLK4TZeD9E1KXBlmXTBxm/UkssSA2501jlf9gPKiKsh5V5GM+XMEN/CkT/GRyCiK6bizmS/UJfCV3XH2FkYBHPArHIOUYaK4kcLdCuyrZCc3NYaX4OnCZxn5Eg1C+EWlQgnZovQZKBBh5GOYiH+NpAnnIJIDXsTjDUAKQkHl2XgL73Z656mfKZisjl9wUjF75Cch0+EUe0biE+o3Jmtp6hZ8y9ImUCL34IRi9+N7avdGZWDqHWFtQ3JH+CqN00A3U29alUC0V29ekP6UQQim8RwkRwcWCQSM+W86Df6Ti6f38R3c2Gci6ctsfI5AVRuHjVOVcLwggOGQ5w4JrHJQIxBWbv2o927duxUE6Qw00QmLgOsLSHnKBL6LoUlsgU9gaRhq0zDyGfiFVnRYzpe38JOESI0yO6zcokEOAbeObaQIPQNyIpp3YNO0FiX/lo198GSRAoqeEQWT1bWsGibOKNPDdSqxSkipLMbZee8YTYt+fwYGPss8upDwlm7xUwk1cTvGTtNxvalWWGsph0A3nKRNSBUgqCk9K5yLRC/329cW/UeQ06ENUg9w4jwPLAGSDvIroiIbIiq3Z3vl85a1BKHazbOhwiq4qCk2zSlkyICkSLTiAlz/PtYdcmmK+VaC5g+COnvYffP0RxxUGEt0nppoNQqPsBH+FenYAd+LwN8BwcyweAzOsDsLZITGUSYeniS1H7EtbPTliD6HI9mtbwUFI+RElV6jDZm7Iqdcm2XgQA8yWI5BLkR2h26WXMdYEe9SwgAngN7SE/O34LPNc9iHmRn2BVgIjWSqiOtOqqFLLQMgLMWDqOlDG/hvQ7qg6Ztdp+KOwwCjVeKI9ctX4zOIp0VH+GRV+CSRErCeUNF92L1HQiEFUzEiU3s3dZCxY8ZTZ7U2U4lFgNHmzYHEMgS5bZfOKPSuQ7CJnyd94Ihls3APuzxi2ZTCCPk+fp1rlSERNRSGxWx2kMxWTxHfAbc94oi1z4Y+RNVpIeSUV6GmH6cIxuzH+kaqeSJSWR3TEkp7i84apXYVCoUmxmCZ04/wCk0Y3zLxuVyKYZHRM2vY1wO6Qx5OtnuieziQZlinspMMOtysjOQxPhLYjL+0kPpeLB7s1oW4cyZhWI2n5J7mPVrNCJi0Lw3tTQSZbgoorgou30DBP0ZEO+ziEdudkg7fzMxdlJYTE5ukAQiDZBIPLicd5Gf71yZl89QziRBKE2gf6ozdVDrmSMqxQ6+Xmq/zRwLa/hQfhdFMUdkd5V0tmCiPQCYbS3ECcJmBmQHRRBUJwLkJFbIlQWoidlFJkCm5ZE+D98/5UvqizqDz+4zz2VO4c6Ue3we9XOmWYotuZuifOsBQ7C8hFF0MNZ82ohKbXSnaDHHyXlbEV049TlzQFw4bsbSl4lHZQRREYQ0EnnykCiRDzpFKmLBDelE8fWX1TUYZU9HYB4eiJonH2i3XTN+WWy6qy64OQQqxh5gqosutDc1nT3aonzrCncEFs5BxV8/5OWJ84Pkjwh1KBS1tBqUik+W/mLvZg9YdT9Bv3GSb/wseM2+Nlpd2ByfBNh62/5DeetOO5bBPIzkLZOj0xdjzTx4wgkPsvLQpkawX8fi0CiBhBWmxAzalLmSzKG38E1wRidS0HDKTC/i17GuHbojBM6vwmKFC4vJGQLPqht+u68rCncVOXiNxa/XpmvRWFDT7CRkF8A8eT5FIhs8LPTX9KNEx8GJ96MdXnLA/XKbHIelTw3Shp5/6ycstnwXIn7oGr+eC8WGrXjPtAXxHUUQZDP5eq2yz3tQKLM41fwQnEV5wi9wWuw8qqEVxOipPTzr6e2PxzUAp0A+8zTNMMgx/MkiIryUl4Cs8sXmXW7P7b4zGCdMnCY3arXlT5CZpDe98DFyzXtayfDEVuFMfwrZj2qUKYkeRUhiiuEntK6+tM5gmhCtObvpcsyIA/0xw0/S3MIs+mRiuiaL5Y3zqKLkLk25Ly6YHWecl3bnzMqqw1TgX6TyB4oxiXrdGXVYm9Y5spU9+QPL/gcxvMkuDRetbOQkmXSLO2WzzrcIK5LDu9ss7rx6zcMulBOerJV7LvHo7xlj9AjrsQQS/KFzETpTWXsyoWiLuv0SRJh1gxxHL62tLI8lSC9uPqtpvun+Y2538Fzvo0SWEEYUUqU+/NmL7jmJUBwSvewvb893sZ11s22i3Xm+j3SrPlEO3k5kD8yARwy94qBbgrnbEqw0XMqWXj+yPSv+Y3T7oNJ+yTk7i9wnS0QKZW052B//3c6hjt3zHmzn2kXU+Yx1LbQ01++xK4Z7t3WnDxmiLQbUPr0RtXOkyyOTp+EeTqvXdQmsDL21d+n4jmnhZ5opnJjqIWLrZ482mdw5UgxJX/klKWlsRI3kkNzvPXaJUDkPxBSAbWUiwBSPwlEycwl68iN4oYB1hi2ywII8Z1ibzrjjtcHujGxHv3f/xPXvJOK9Kget6+/RSBrfXtXu194F4yBv4Za+ETMT2/Y5i5AQfR7HpZJ336jxHEOrC4Djdei3sjTjHhQnoFGrSfUQrpo8t9hWYUxG/+C362CNbu6o0yGVviqXIflq2SAcC9ICG4kf0Zelywk6YuoDCbxL/E/FcJ50hvxi/yIHYWe/Fnq/5W3mSstuLCnO9RKWcLPtda1l07OQVzZVo5kaarsgC2fscQll0LsshivNhH93KO23S9AlPbnGRno6ePx8/iVjCaT48eJw9QHgjFlrs0ZIlNJZn8oJMQdZRBl+Cj/7nOUInaSd/5oWi1Wrt0bKppuOM0fWfi3YOOw+CR81vdyzoZ1sX/69TiRZQED45wowyQfQP88RotDUy3MYN3sCVZt2kN0nDffJdRhNyai6H1CfWIkbofWigkgkjTzXhBconEuGcUgwzaweIS4BMe8j5n840D05hMOTcb49VN84UIWanHkOQndnDvI96iO3fq8lD6kq/LqHBcwZpyLZo9d5OHKmT36QYi28iYYD+9gBhtLOstjq9bDo78R3r0RaqGogiPPZy2AyOS649MduzadNSyd5mSeJNRw7UZRzegaSy2ZpNJPkNceatFIvwEUe5FrXuCA7lCosHqjNCKGraVfMLZmrs7mi/YaWAw/pnrxAqy1JnbIJO/qkiI4xcQdKz4Mx5/mgURzuFr+yZhLeXTNPTXxaVwujs2+vFpOyy+yV7lPQiDxuntsHA7TJnO+UEZOrOPbXtUuG5hp5nh/rLSYlSyoBjEu3044kzg8LK1h/9Ry33lo1XRQKPiCxHgTs77cMSEB3FBz5a5XWv5l+WHteC2Dc4HI8h9Ud0wb7yzXC8RbFAgnNR0LzJrY7ffYIZJh39KTKcHoSh3motXN2j3eJhY4QAysa2snLxN9KVsCatj7L9bGvz8lEFnMrDchHNTZsdq7l8pl3byZtNAbl0bDcX2KxNUR7fte1bLuDOTe91W0WEqeHYvEoIlY1EU48LNF72+PP3XGiPR/L42tddP+9Y7HL0GjxySadPGBWdHaY4gYbv7mnYqG1Z++1vLoRfYrPEZgk93fgpFl11O8v7xJcorQKWNfTBVxYoQarusO7/r91SPAGekBSHpNqSQKcYr1JrYxrOhlwkk7WN5C7Za+cCBiEYNwMeKv1MMAOFGk+PJBp1R1SOvL1TMmmySHFTh+Qme81g4xNfLESOcUyap/bPvHxViD3YSuo9xPoYIBfcy8UaeQ91TZ2imsKVLgR/XLJutMocy2x0qmgih6dcd0ZOlEv0YeVhjVIkrl6Yfqjgn0MjBv/OPaKbkq8BFV9LRtiV13n25MTYjYl2rlvrVRQgQZBS7gb/ykZ0DhRHeo4Yv39jL/R8OW6hD52ZzzweZv1nS6ZcEcFT/L2tqjlBBuXhhNk4jGXBM/Dsp79RvbO0qWpz7jqHtlt4zj1GIfjKx8EAVpf6uOe/j6QJ23ZnLZLyce+Qb6FiEER3DxFKdWSos+CjV86V7oCG2Uv8o7na23RdcvKIuc/RuyUqjuqiwmOSY1V6+OiGiit3jSWDAmqpqnlxEfqGy46T9ebr5rftqzjPZNNjiW3wPGhHPx8C/obMaBrZ3U3UexFu24iGt4KdAReJFXj7iXowvA/acaLDUrY+f9b03jrc+91fGrs1Pr1Hg+Y6xtfYunQ7GbzkV5zAaIiDg1TEOgUugZXlym2I3ygTiBQM3MVjqk25C+UAgmuP0ed3EvWE185S9SCruqG7/5xNvvPL64V2eJHNKuo1qMpRaK+d5SpvnRKKw8eoUvwBbuE2/9n8hXT4libcFBOmS7bGyW0rws0Qfot17H2KtyFbqmtYinGI7dyR8F2GnobHrpLa+03T0jtVCQV4ccSxsRpL/WF5WNV84qZxffVMbO2QRdU48eVR9jWQQtnKHlbrK9EhBL69MJyb0Bv+E/DaAQ4kWjzZ1EWAcIsGC/zqbVg/s2+cMnf21b450n9xoUxkLWE3fyjtVNNuWnwuf+OCnYeMmp1N4VSPxhGbvg1+j0EIS4qUNFYCv1OaSFml68J4SAPtNv+L8FPgPT2bwQTO5f+1jhD1Fdf/3W2K1nUrF3f6KUSkk5Ica3PsQBYjZm6Z9LS9+ojdR/1SnTfUxZgnLQpQQ+5l5Cv1E3irr3Nk7I1nuX9APuOU6EXKwzuToqn9w0nSsXCdE1lfFt+CLLh7rLmQL6W3MoRRAdO84B49v4Npa2/wd31tqvZ8W+mgAAAABJRU5ErkJggg==);background-position:center;background-repeat:no-repeat;background-size:63px;bottom:0;content:"";height:63px;padding:0;position:absolute;right:0;width:63px}#shazamify:hover{transform:scale(1.1,1.1);transition:transform}@media (max-width:740px){#shazamify{display:none}}')

  attachEvents()
  getTrack()
})()
