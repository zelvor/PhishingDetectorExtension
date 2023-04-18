import os
import re
import ssl
import pandas as pd
ssl._create_default_https_context = ssl._create_unverified_context
from datetime import datetime
from dateutil.parser import parse as date_parse
import whois
import requests
from bs4 import BeautifulSoup
import socket
import xml.etree.ElementTree as ET
from urllib.parse import urlencode, urlparse
from contextlib import closing
import dns.resolver
from similarweb import TrafficClient
import ipaddress

import threading
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import time


def url_ip(url):
    hostname = urlparse(url)[1]
    # match = re.search('(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\/)|'  # IPv4
    #                     # IPv4 in hexadecimal
    #                     '((0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\/)'
    #                     '(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}', url)  # IPv6
    # if match:
    #     return 1
    # return -1
    try:
        ipaddress.IPv4Address(hostname)
        return 1
    except:
        return -1

def url_length(url):
    length = len(url)
    if length < 54:
        return -1
    elif length > 75:
        return 1
    return 0

def url_shorten(url):
    match = re.search('bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|'
                        'yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|'
                        'short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|'
                        'doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|'
                        'db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|'
                        'q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|'
                        'x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|tr\.im|link\.zip\.net', url)
    if match:
        return 1
    return -1

def url_symbol(url):
    if '@' in url:
        return 1
    return -1

def url_double_slash(url):
    list = [x.start(0) for x in re.finditer('//', url)]
    if list[len(list) - 1] > 6:
        return 1
    return -1

def url_prefix_suffix(url):
    if re.findall(r"https?://[^\-]+-[^\-]+/", url):
        return 1
    return -1

def url_sub_domain(url):
    temp = len(re.findall("\.", url))
    if temp == 1:
        return -1
    elif temp == 2:
        return 0
    return 1

def https(url):
    match = re.search('https://|http://', url)
    if match == None:
        return 1
    return -1

def check_domain_expired(url):
    today = datetime.utcnow()
    try:
        w = whois.whois(url)
    # except whois.parser.PywhoisError as e:
    #     print(e)
    #     exit(1)
    except:
        return 1

    if w.expiration_date is None:
        return 1

    
    if type(w.expiration_date) == list:
        w.expiration_date = w.expiration_date[0]
    else:
        w.expiration_date = w.expiration_date
    expiration_date = datetime(w.expiration_date.year,w.expiration_date.month,w.expiration_date.day)
    diff = expiration_date - today
    if diff.days/365.0 <= 1:
        return 1
    return -1

def favicon(soup, domain):
    if domain.domain_name is None:
        return 1

    if isinstance(domain.domain_name, list):
        domain = domain.domain_name[0]
    else:
        domain = domain.domain_name

    for head in soup.find_all('head'):
        for head.link in soup.find_all('link', href=True):
            dots = [x.start(0) for x in re.finditer('\.', head.link['href'])]
            if domain in head.link['href']:
                return -1
            else:
                return 1
    return -1

NonStdPort = {21:1,22:1,23:1,80:0,443:0,445:1,1433:1,1521:1,3306:1,3389:1}
def check_stdport(url):
    hostname = urlparse(url).hostname
    # print(hostname)
    host=socket.gethostbyname(hostname)
    # print(host)
    timeout_seconds=1
    for port, status in NonStdPort.items():
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            sock.settimeout(timeout_seconds)
            result = sock.connect_ex((host, port))
            if result != 0:
                result = 1
            if result != status:
                # print(result)
                # print(port)
                return 1
    return -1

def https_token(url):
    match = re.search('https://|http://', url)
    if match.start(0) == 0:
        url = url[match.end(0):]
    match = re.search('http|https', url)
    if match:
        return 1
    return -1

def request_url(soup, domain):
    try:
        i = 0
        success = 0

        if isinstance(domain.domain_name, list):
            domain = domain.domain_name[0].lower()
        else:
            domain = domain.domain_name.lower()

        for img in soup.find_all('img', src=True):
            dots = [x.start(0) for x in re.finditer('\.', img['src'])]
            if domain not in img['src']:
                success = success + 1
            i = i + 1

        for audio in soup.find_all('audio', src=True):
            dots = [x.start(0) for x in re.finditer('\.', audio['src'])]
            if domain not in audio['src']:
                success = success + 1
            i = i + 1

        for embed in soup.find_all('embed', src=True):
            dots = [x.start(0) for x in re.finditer('\.', embed['src'])]
            if domain not in embed['src']:
                success = success + 1
            i = i + 1

        for i_frame in soup.find_all('i_frame', src=True):
            dots = [x.start(0) for x in re.finditer('\.', i_frame['src'])]
            if domain not in i_frame['src']:
                success = success + 1
            i = i + 1
        percentage = success / float(i)
        return round(percentage, 2)
    except:
        return 1

def evaluate_request(soup, domain):
    percentage = request_url(soup, domain)
    if percentage < 0.22:
        return 1
    elif percentage > 0.61:
        return -1
    return 0

def url_of_anchor(soup):
    #try:
        # if the anchor does not link to any page, unsafe +1
        i = 0
        unsafe = 0
        for a in soup.find_all('a', href=True):
            i = i + 1
            if a['href'] == "#" or a['href'] == "#content" or a['href'] == "javascript:void(0)" or a['href'] == "#skip":
                unsafe = unsafe + 1
        if i == 0:
            return 1
        else:
            percentage = unsafe / float(i)
            return round(percentage, 2)
    # except:
    #     return 1

# <31% legit, >67% phishing
def evaluate_url_of_anchor(soup):
    percentage = url_of_anchor(soup)
    if percentage < 0.31:
        return -1
    elif percentage > 0.67:
        return 1
    return 0

#Links in <Meta>, <Script> and <Link> tags. It is expected that these tags are linked to the same domain of the webpage.
def links_in_tags(soup, domain):
    try:
        i = 0
        success = 0

        if isinstance(domain.domain_name, list):
            domain = domain.domain_name[0].lower()
        else:
            domain = domain.domain_name.lower()

        for link in soup.find_all('link', href=True):
            dots = [x.start(0) for x in re.finditer('\.', link['href'])]
            if domain not in link['href']:
                success = success + 1
            i = i + 1

        for script in soup.find_all('script', src=True):
            dots = [x.start(0) for x in re.finditer('\.', script['src'])]
            if domain not in script['src']:
                success = success + 1
            i = i + 1

        for meta in soup.find_all('meta', href=True):
            dots = [x.start(0) for x in re.finditer('\.', meta['href'])]
            if domain not in meta['href']:
                success = success + 1
            i = i + 1
        percentage = success / float(i)
        return round(percentage, 2)
    except:
        return 0

def evaluate_links_in_tags(soup, domain):
    percentage = links_in_tags(soup, domain)
    if percentage < 0.17:
        return -1
    elif percentage > 0.81:
        return 1
    return 0

def sfh(soup, domain):
    if domain.domain_name is None:
        return 1

    if isinstance(domain.domain_name, list):
        domain = domain.domain_name[0]
    else:
        domain = domain.domain_name

    for form in soup.find_all('form', action = True):
        if form['action'] =="" or form['action'] == "about:blank" :
            return 1
        elif domain not in form['action']:
            return 0
        else:
            return -1
    return -1

def submit_to_email(soup):
   for form in soup.find_all('form', action= True):
      if ("mail()" or "mailto:") in form['action']:
          return 1
      else:
          return -1
   return -1

def abnormal_url(domain, url):
    if domain.domain_name is None:
        return 1

    domain = whois.whois(url)
    if isinstance(domain.domain_name, list):
        for domains in domain.domain_name:
            if domains.lower() in url:
                return -1
        return 1
    else:
        if domain.domain_name.lower() in url:
            return -1
        else:
            return 1

def redirect(url):
    try:
        count = 0
        while True:
            r = requests.head(url)
            if 300 < r.status_code < 400:
                url = r.headers['location']
                count += 1
            else:
                return count
    except:
        return 0

def website_forwarding(url):
    count = redirect(url)
    if count <= 1:
        return -1
    elif count >= 4:
        return 1
    return 0

def status_bar(html):
    if re.findall("<script>.+onmouseover.+</script>", html):
        return 1
    return -1


def right_mouse(html):
    if re.findall(r"event.button ?== ?2", html):
        return 1
    return -1

def pop_up(html):
    if re.findall(r"prompt\(", html):
        return 1
    return -1

def iframe(soup):
    for iframe in soup.find_all('iframe', width=True, height=True, frameBorder=True):
        if iframe['width']=="0" and iframe['height']=="0" and iframe['frameBorder']=="0":
            return 1
        else:
            return -1
    return -1

def age_of_domain(domain):
    try:
        whois_response = domain
        if isinstance(whois_response.creation_date, list):
            creation_date = whois_response.creation_date[0]
        else:
            creation_date = whois_response.creation_date
        ageofdomain = abs((datetime.now() - creation_date).days)
        if ageofdomain < 180:
            return 1
        else:
            return -1
    except:
        return 1
    
def dns_record(domain):
    domain_name = domain.domain_name[0] if isinstance(domain.domain_name, list) else domain.domain_name
    try:
        #check DNS record
        if dns.resolver.resolve(domain_name, 'A'):
            return -1
        else:
            return 1
    
    except:
        return 1


def website_traffic(url):
    try:
        domain = whois.whois(url)
        domain_name = domain.domain_name[0].lower() if isinstance(domain.domain_name, list) else domain.domain_name.lower()
        url = "https://api.similarweb.com/v1/similar-rank/{domain_name}/rank?api_key={similarweb_api_key}".format(domain_name=domain_name, similarweb_api_key="06c809e7bd8c44f19bfb2670aad43981")
        #content of url
        content = requests.get(url).json()
        rank = content['similar_rank']['rank']
        if rank < 200000:
            return -1
        elif rank >= 1000000:
            return 1
        else:
            return 0
    except:
        return 1

def page_rank(url):
    try:
        domain_name = whois.whois(url).domain_name
        if domain_name is None:
            return 1
        domain_name = domain_name[0] if isinstance(domain_name, list) else domain_name
        url = 'https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=' + domain_name
        request = requests.get(url, headers={'API-OPR':'w0k40w0448gk40cc0w8gcs8kcc0o4kkw44cwso00'})
        result = request.json()
        result = result['response'][0]['page_rank_integer']
        if result <= 1:
            return 1
        return -1
    except:
        return 1

def google_index(url):
    #time.sleep(.6)
    google = "https://www.google.com/search?q=site:" + url + "&hl=en"
    response = requests.get(google, cookies={"CONSENT": "YES+1"})
    soup = BeautifulSoup(response.content, "html.parser")
    not_indexed = re.compile("did not match any documents")
    if soup(text=not_indexed):
        return 1
    else:
        return -1

def point_to_page(html):
    number_of_links = len(re.findall(r"<a href=", html))
    if number_of_links == 0:
        return 1
    elif number_of_links > 2:
        return -1
    return 0

def statistical_report(url, domain):
    if domain.domain_name is None:
        return 1

    domain = domain.domain_name[0] if isinstance(domain.domain_name, list) else domain.domain_name
    url_match=re.search('at\.ua|usa\.cc|baltazarpresentes\.com\.br|pe\.hu|esy\.es|hol\.es|sweddy\.com|myjino\.ru|96\.lt|ow\.ly',url)
    try:
        ip_address=socket.gethostbyname(domain)
    except:
        return 1
    ip_match=re.search('146\.112\.61\.108|213\.174\.157\.151|121\.50\.168\.88|192\.185\.217\.116|78\.46\.211\.158|181\.174\.165\.13|46\.242\.145\.103|121\.50\.168\.40|83\.125\.22\.219|46\.242\.145\.98|'
                        '107\.151\.148\.44|107\.151\.148\.107|64\.70\.19\.203|199\.184\.144\.27|107\.151\.148\.108|107\.151\.148\.109|119\.28\.52\.61|54\.83\.43\.69|52\.69\.166\.231|216\.58\.192\.225|'
                        '118\.184\.25\.86|67\.208\.74\.71|23\.253\.126\.58|104\.239\.157\.210|175\.126\.123\.219|141\.8\.224\.221|10\.10\.10\.10|43\.229\.108\.32|103\.232\.215\.140|69\.172\.201\.153|'
                        '216\.218\.185\.162|54\.225\.104\.146|103\.243\.24\.98|199\.59\.243\.120|31\.170\.160\.61|213\.19\.128\.77|62\.113\.226\.131|208\.100\.26\.234|195\.16\.127\.102|195\.16\.127\.157|'
                        '34\.196\.13\.28|103\.224\.212\.222|172\.217\.4\.225|54\.72\.9\.51|192\.64\.147\.141|198\.200\.56\.183|23\.253\.164\.103|52\.48\.191\.26|52\.214\.197\.72|87\.98\.255\.18|209\.99\.17\.27|'
                        '216\.38\.62\.18|104\.130\.124\.96|47\.89\.58\.141|78\.46\.211\.158|54\.86\.225\.156|54\.82\.156\.19|37\.157\.192\.102|204\.11\.56\.48|110\.34\.231\.42',ip_address)
    if url_match or ip_match:
        return 1
    else:
        return -1


def features_list(url):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    try:
        domain = whois.whois(url)
    except:
        domain = None
    html = requests.get(url).text

    features_list = [0]*30
    if domain == None:
        features_list[0] = url_ip(url)
        features_list[1] = url_length(url)
        features_list[2] = url_shorten(url)
        features_list[3] = url_symbol(url)
        features_list[4] = url_double_slash(url)
        features_list[5] = url_prefix_suffix(url)
        features_list[6] = url_sub_domain(url)
        features_list[7] = https(url)
        features_list[8] = check_domain_expired(url)
        features_list[9] = 1
        features_list[10] = check_stdport(url)
        features_list[11] = https_token(url)
        features_list[12] = 1
        features_list[13] = evaluate_url_of_anchor(soup)
        features_list[14] = 1
        features_list[15] = 1
        features_list[16] = submit_to_email(soup)
        features_list[17] = 1
        features_list[18] = website_forwarding(url)
        features_list[19] = status_bar(html)
        features_list[20] = right_mouse(html)
        features_list[21] = pop_up(html)
        features_list[22] = iframe(soup)
        features_list[23] = 1
        features_list[24] = 1
        features_list[25] = website_traffic(url)
        features_list[26] = page_rank(url)
        features_list[27] = google_index(url)
        features_list[28] = point_to_page(html)
        features_list[29] = 1

    else:
        features_list[0] = url_ip(url)
        features_list[1] = url_length(url)
        features_list[2] = url_shorten(url)
        features_list[3] = url_symbol(url)
        features_list[4] = url_double_slash(url)
        features_list[5] = url_prefix_suffix(url)
        features_list[6] = url_sub_domain(url)
        features_list[7] = https(url)
        features_list[8] = check_domain_expired(url)
        features_list[9] = favicon(soup, domain)
        features_list[10] = check_stdport(url)
        features_list[11] = https_token(url)
        features_list[12] = evaluate_request(soup, domain)
        features_list[13] = evaluate_url_of_anchor(soup)
        features_list[14] = evaluate_links_in_tags(soup, domain)
        features_list[15] = sfh(soup, domain)
        features_list[16] = submit_to_email(soup)
        features_list[17] = abnormal_url(domain, url)
        features_list[18] = website_forwarding(url)
        features_list[19] = status_bar(html)
        features_list[20] = right_mouse(html)
        features_list[21] = pop_up(html)
        features_list[22] = iframe(soup)
        features_list[23] = age_of_domain(domain)
        features_list[24] = dns_record(domain)
        features_list[25] = website_traffic(url)
        features_list[26] = page_rank(url)
        features_list[27] = google_index(url)
        features_list[28] = point_to_page(html)
        features_list[29] = statistical_report(url, domain)
    return features_list

def speed_features_list(url):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')
    try:
        domain = whois.whois(url)
    except:
        domain = None
    html = requests.get(url).text

    features_list = [0]*30
    executor = ThreadPoolExecutor()
    my_max_workers = executor._max_workers

    if domain == None:
        with concurrent.futures.ThreadPoolExecutor(max_workers=my_max_workers) as executor:
            fl0 = executor.submit(url_ip, url)
            fl1 = executor.submit(url_length, url)
            fl2 = executor.submit(url_shorten, url)
            fl3 = executor.submit(url_symbol, url)
            fl4 = executor.submit(url_double_slash, url)
            fl5 = executor.submit(url_prefix_suffix, url)
            fl6 = executor.submit(url_sub_domain, url)
            fl7 = executor.submit(https, url)
            fl8 = executor.submit(check_domain_expired, url)
            fl9 = 1
            fl10 = executor.submit(check_stdport, url)
            fl11 = executor.submit(https_token, url)
            fl12 = 1
            fl13 = executor.submit(evaluate_url_of_anchor, soup)
            fl14 = 1
            fl15 = 1
            fl16 = executor.submit(submit_to_email, soup)
            fl17 = 1
            fl18 = executor.submit(website_forwarding, url)
            fl19 = executor.submit(status_bar, html)
            fl20 = executor.submit(right_mouse, html)
            fl21 = executor.submit(pop_up, html)
            fl22 = executor.submit(iframe, soup)
            fl23 = 1
            fl24 = 1
            fl25 = executor.submit(website_traffic, url)
            fl26 = executor.submit(page_rank, url)
            fl27 = executor.submit(google_index, url)
            fl28 = executor.submit(point_to_page, html)
            fl29 = 1

            features_list[0] = fl0.result()
            features_list[1] = fl1.result()
            features_list[2] = fl2.result()
            features_list[3] = fl3.result()
            features_list[4] = fl4.result()
            features_list[5] = fl5.result()
            features_list[6] = fl6.result()
            features_list[7] = fl7.result()
            features_list[8] = fl8.result()
            features_list[9] = fl9
            features_list[10] = fl10.result()
            features_list[11] = fl11.result()
            features_list[12] = fl12
            features_list[13] = fl13.result()
            features_list[14] = fl14
            features_list[15] = fl15
            features_list[16] = fl16.result()
            features_list[17] = fl17
            features_list[18] = fl18.result()
            features_list[19] = fl19.result()
            features_list[20] = fl20.result()
            features_list[21] = fl21.result()
            features_list[22] = fl22.result()
            features_list[23] = fl23
            features_list[24] = fl24
            features_list[25] = fl25.result()
            features_list[26] = fl26.result()
            features_list[27] = fl27.result()
            features_list[28] = fl28.result()
            features_list[29] = fl29
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=my_max_workers) as executor:
            fl0 = executor.submit(url_ip, url)
            fl1 = executor.submit(url_length, url)
            fl2 = executor.submit(url_shorten, url)
            fl3 = executor.submit(url_symbol, url)
            fl4 = executor.submit(url_double_slash, url)
            fl5 = executor.submit(url_prefix_suffix, url)
            fl6 = executor.submit(url_sub_domain, url)
            fl7 = executor.submit(https, url)
            fl8 = executor.submit(check_domain_expired, url)
            fl9 = executor.submit(favicon, soup, domain)
            fl10 = executor.submit(check_stdport, url)
            fl11 = executor.submit(https_token, url)
            fl12 = executor.submit(evaluate_request, soup, domain)
            fl13 = executor.submit(evaluate_url_of_anchor, soup)
            fl14 = executor.submit(evaluate_links_in_tags, soup, domain)
            fl15 = executor.submit(sfh, soup, domain)
            fl16 = executor.submit(submit_to_email, soup)
            fl17 = executor.submit(abnormal_url, domain, url)
            fl18 = executor.submit(website_forwarding, url)
            fl19 = executor.submit(status_bar, html)
            fl20 = executor.submit(right_mouse, html)
            fl21 = executor.submit(pop_up, html)
            fl22 = executor.submit(iframe, soup)
            fl23 = executor.submit(age_of_domain, domain)
            fl24 = executor.submit(dns_record, domain)
            fl25 = executor.submit(website_traffic, url)
            fl26 = executor.submit(page_rank, url)
            fl27 = executor.submit(google_index, url)
            fl28 = executor.submit(point_to_page, html)
            fl29 = executor.submit(statistical_report, url, domain)

            features_list[0] = fl0.result()
            features_list[1] = fl1.result()
            features_list[2] = fl2.result()
            features_list[3] = fl3.result()
            features_list[4] = fl4.result()
            features_list[5] = fl5.result()
            features_list[6] = fl6.result()
            features_list[7] = fl7.result()
            features_list[8] = fl8.result()
            features_list[9] = fl9.result()
            features_list[10] = fl10.result()
            features_list[11] = fl11.result()
            features_list[12] = fl12.result()
            features_list[13] = fl13.result()
            features_list[14] = fl14.result()
            features_list[15] = fl15.result()
            features_list[16] = fl16.result()
            features_list[17] = fl17.result()
            features_list[18] = fl18.result()
            features_list[19] = fl19.result()
            features_list[20] = fl20.result()
            features_list[21] = fl21.result()
            features_list[22] = fl22.result()
            features_list[23] = fl23.result()
            features_list[24] = fl24.result()
            features_list[25] = fl25.result()
            features_list[26] = fl26.result()
            features_list[27] = fl27.result()
            features_list[28] = fl28.result()
            features_list[29] = fl29.result()

    return features_list



# start_time = time.time()
# print(features_list('https://www.google.com/'))
# print("--- %s seconds ---" % (time.time() - start_time))


# start_time = time.time()
# print(speed_features_list('https://www.google.com/'))
# print("--- %s seconds ---" % (time.time() - start_time))


import joblib



# try:
#     output = features_list('http://paulmitchellforcongress.com/wp-content/languages/login.php')
#     print(output)
# except Exception as e:
#     print(e)



# print(SVM_model.predict([output]))
# print(DT_model.predict([output]))
# print(KNN_model.predict([output]))
# print(LG_model.predict([output]))
# print(RFC_model.predict([output]))

# import argparse
# def parse_args():
#     parser = argparse.ArgumentParser(description='Phishing URL Detection')
#     parser.add_argument('--url', type=str, default=None, help='URL to check')

#     args = parser.parse_args()
#     return args



def detect(url):
    with open('result.txt', 'w') as f:
        f.write('Loading')

    # DT_model = joblib.load('models/DT_model.pkl')
    # KNN_model = joblib.load('models/KNN_model.pkl')
    # LG_model = joblib.load('models/LG_model.pkl')
    # RFC_model = joblib.load('models/RFC_model.pkl')
    SVM_model = joblib.load('models/SVM_model.pkl')
    # args = parse_args()
    # url = args.url
    try:
        # output = features_list(url)
        output = speed_features_list(url)
        # print(output)
    except Exception as e:
        print(e)
    result = SVM_model.predict([output])
    if result == 1:
        #write to file txt mode w
        with open('result.txt', 'w') as f:
            f.write('Phish')
        return 'Phish'
    else:
        #write to file txt mode w
        with open('result.txt', 'w') as f:
            f.write('Legit')
        return 'Legit'
