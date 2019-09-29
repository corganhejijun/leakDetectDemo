using System.Collections;
using System.Threading;

namespace WindowsForms4M
{
    class Work
    {
        public delegate void WorkDelegate(object param);
        public object param;
        public WorkDelegate fun;

        public Work(object param, WorkDelegate fun)
        {
            this.param = param;
            this.fun = fun;
        }
    }
    class ClassWorker
    {
        Thread thread;
        static ArrayList workList;
        static bool running;
        public ClassWorker()
        {
            running = true;
            thread = new Thread(threadWorker);
            thread.Start();
            workList = new ArrayList();
        }

        public void addwork(Work work)
        {
            workList.Add(work);
        }

        static void threadWorker()
        {
            while (running)
            {
                if (workList.Count == 0)
                {
                    Thread.Sleep(10);
                    continue;
                }
                Work work = (Work)workList[0];
                workList.RemoveAt(0);
                work.fun(work.param);
            }
        }

        public void close()
        {
            running = false;
        }
    }
}
