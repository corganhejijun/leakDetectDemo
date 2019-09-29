using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace WindowsForms4M
{
    class ClassWeb
    {
        public delegate void OnGetPost(string postBody);
        static HttpListener listener;
        Thread thread;
        static bool running;
        static OnGetPost deleOnGetPost;
        public ClassWeb(OnGetPost onGetPost)
        {
            deleOnGetPost = onGetPost;
            running = true;
            thread = new Thread(threadWorker);
            listener = new HttpListener();
            listener.AuthenticationSchemes = AuthenticationSchemes.Anonymous;//指定身份验证 Anonymous匿名访问
            listener.Prefixes.Add("http://127.0.0.1:8880/");
            thread.Start();
        }

        public static string Post(string url, string content)
        {
            string result = "";
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
            req.Method = "POST";
            req.ContentType = "application/x-www-form-urlencoded";

            byte[] data = Encoding.UTF8.GetBytes(content);
            req.ContentLength = data.Length;

            try
            {
                Console.WriteLine("send content " + content);
                using (Stream reqStream = req.GetRequestStream())
                {
                    reqStream.Write(data, 0, data.Length);
                    reqStream.Close();
                }
                Console.WriteLine("send over");
                HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
                Console.WriteLine("received stream");
                Stream stream = resp.GetResponseStream();
                //获取响应内容
                using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
                {
                    result = reader.ReadToEnd();
                }
            }
            catch (Exception e)
            {
                result = e.ToString();
            }
            return result;
        }

        static void threadWorker()
        {
            listener.Start();
            while (running)
            {
                HttpListenerContext context = listener.GetContext();
                // 取得请求对象
                HttpListenerRequest request = context.Request;
                Stream stream = request.InputStream;
                System.IO.StreamReader reader = new System.IO.StreamReader(stream, Encoding.UTF8);
                string postBody = reader.ReadToEnd();
                deleOnGetPost(postBody);
                string responseString = "{result:true}";
                HttpListenerResponse response = context.Response;
                response.StatusCode = 200;
                response.ContentLength64 = System.Text.Encoding.UTF8.GetByteCount(responseString);
                response.ContentType = "application/json";
                System.IO.Stream output = response.OutputStream;
                System.IO.StreamWriter writer = new System.IO.StreamWriter(output);
                writer.Write(responseString);
                writer.Close();
            }
            listener.Close();
        }

        public void close()
        {
            running = false;
            thread.Abort();
        }
    }
}
