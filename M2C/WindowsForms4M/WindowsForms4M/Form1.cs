using System;
using System.Collections;
using System.Windows.Forms;


namespace WindowsForms4M
{
    public partial class Form1 : Form
    {
        public delegate void OnGetCalculate(ArrayList results);

        ClassWorker classWorker;
        MatlabCal matlabCal;
        ClassWeb classWeb;
        public Form1()
        {
            string text = System.IO.File.ReadAllText("formConfig.ini");
            InitializeComponent();
            classWorker = new ClassWorker();
            matlabCal = new MatlabCal();
            classWeb = new ClassWeb(new ClassWeb.OnGetPost(onPost));
            textBox1.Text = text;
        }

        void calculate(object param)
        {
            object[] pList = (object[])param;
            string database = (string)pList[0];
            string table = (string)pList[1];
            double length = double.Parse((string)pList[2]);
            double radius = double.Parse((string)pList[3]);
            double thickness = double.Parse((string)pList[4]);
            double distance, tick;
            string time = "";
            try
            {
                matlabCal.getGasCalculate(database, table, length, radius, thickness, out distance, out tick);
                DateTime converted = new DateTime(1970, 1, 1, 0, 0, 0, 0);
                time = converted.AddSeconds((int)tick).ToString("yyyy-MM-dd HH:mm:ss");
            }
            catch (Exception e)
            {
                Console.WriteLine("Matlab Exception: {0}", e);
                distance = -1;
                time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            }
            ArrayList results = new ArrayList();
            results.Add(table);
            results.Add(distance);
            results.Add(time);
            this.BeginInvoke(new OnGetCalculate(onGetCalculate), new object[] { results });
        }

        void onGetCalculate(ArrayList results)
        {
            string tableName = (string)results[0];
            double distance = (double)results[1];
            string time = (string)results[2];
            ArrayList outList = new ArrayList();
            outList.Add(tableName);
            outList.Add(distance);
            outList.Add(time);
            Work work = new Work(outList, sendPost);
            classWorker.addwork(work);
        }

        void sendPost(object param)
        {
            ArrayList outList = (ArrayList)param;
            string tableName = (string)outList[0];
            double distance = (double)outList[1];
            string time = (string)outList[2];
            string result = ClassWeb.Post("http://127.0.0.1:3000/M2C/", 
                "{\"name\":\"" + tableName + "\",\"distance\":" + distance + ",\"time\":\"" + time + "\"}");
            this.BeginInvoke(new ClassWeb.OnGetPost(onGetPost), new object[] { result });
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            classWorker.close();
            classWeb.close();
        }

        void onPost(string postBody)
        {
            this.BeginInvoke(new ClassWeb.OnGetPost(onGetPost), new object[] { postBody });
        }

        void onGetPost(string post)
        {
            if (post.StartsWith("table:"))
            {
                string[] list = post.Split(':');
                string tableName = list[1];
                string length = list[2];
                string radius = list[3];
                string thickness = list[4];
                object[] table1 = { textBox1.Text, tableName, length, radius, thickness };
                Work work = new Work(table1, calculate);
                classWorker.addwork(work);
            }
        }
    }
}
