public class ArraysNt {

    static double getAverage(int [] arr) {
        double sum = 0;
        //Enhanced loops
        for (int i : arr) {
            sum += i;

        }
        int size = arr.length;
        double avg = sum / size;
        return avg;
    }

        static void main (){
        int [] arr = {1,2,3,4};
            System.out.println(getAverage(arr));

        }

}