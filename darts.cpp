#include <iostream>
#include <cstdlib>
using namespace std;
const int ROWS = 5, COLS = 5, N_GIVEN = 16;//the size of the target and the type number of boxes
const float EQUIVALENT = 3.0;//1 chance weights ? points
const int N_BOXES = ROWS*COLS;
struct Box
{
	int key;
	int a;
	char* ch;
};
const struct Box given[N_GIVEN] =
{
	{ 0, 0, "=" },
	{ 1, -6, "-6" },
	{ 1, -2, "-2" },
	{ 1, 1, "+1" },
	{ 1, 2, "+2" },
	{ 1, 3, "+3" },
	{ 1, 4, "+4" },
	{ 1, 5, "+5" },
	{ 1, 6, "+6" },
	{ 2, -2, "x(-2)" },
	{ 2, 0, "x0" },
	{ 3, 1, "+" },
	{ 3, 2, "++" },
	{ 3, 3, "+++" },
	{ 4, 0, "END" },
	{ -1, 0, "~" }
};//{type,figure,name}
class Player
{
public:
	long long point;
	int chance;
	int n_acc;//accuracy=n_acc/(n_acc+4)
private:
	void change(int key, int a)
	{
		switch (key)
		{
		case 1:
			point = point + a;
			break;
		case 2:
			point = point*a;
			break;
		case 3:
			chance = chance + a;
			break;
		case 4:
			chance = 0;
			break;
		default:
			;
		}
		return;
	}
	float getActualTimes(int times)
	{
		float actualTimes = (chance * 2 > times) ? (float(times) / 2) : chance;
		return actualTimes;
	}//the chance number considering total left chances
	float getMarks(float original, int times)
	{
		float absPoint0, absPoint, diffabs, actualTimes, output;
		actualTimes = getActualTimes(times);
		if (actualTimes < 1.5)
		{
			output = original;
		}
		else
		{
			absPoint0 = (float(point) < 0) ? (-float(point)) : float(point);
			absPoint = (float(point) + original < 0) ? (-float(point) - original) : (float(point) + original);
			diffabs = absPoint - absPoint0;
            if(n_acc != -1)
            {
                output = (diffabs*n_acc + original * 4) / (n_acc + 4);
            }
			else
            {
                output = diffabs;
            }
		}
		return output;
	}//value a certain box considering -(-x)=x
public:
	int hurl(int p, int list[N_GIVEN], int times, int theOtherChance, int theOtherPoint)//the list contains the codes of boxes on the target
	{
		chance--;
		int i, j, k, n;
		int mark;
		float decision1[N_BOXES], decision2[N_BOXES];
		float competitor, marks, compare = -1;
		switch (p)
		{
		case 1:
			cout << "Towards Row ";
			cin >> i;
			cout << "Column ";
			cin >> j;
			break;
		case 2:
			cout << "Towards Row ";
			cin >> i;
			cout << "Column ";
			cin >> j;
			break;
		case 21:
			//the bot starts
			competitor = (times - theOtherChance - chance) / 2;
			for (k = 0; k < N_BOXES; k++)
			{
				switch (list[k])
				{
				case 0:
					if (theOtherChance == 0 || times == 0)
					{
						marks = 0;
					}
					else
					{
						marks = theOtherPoint - point;
					}
					marks = getMarks(marks, times);
					break;
				case 1:
					marks = getMarks(-6, times);
					break;
				case 2:
					marks = getMarks(-2, times);
					break;
				case 3:
					marks = getMarks(1, times);
					break;
				case 4:
					marks = getMarks(2, times);
					break;
				case 5:
					marks = getMarks(3, times);
					break;
				case 6:
					marks = getMarks(4, times);
					break;
				case 7:
					marks = getMarks(5, times);
					break;
				case 8:
					marks = getMarks(6, times);
					break;
				case 9:
					marks = point*(-3);
					marks = getMarks(marks, times);
					break;
				case 10:
					marks = point*(-1);
					marks = getMarks(marks, times);
					break;
				case 11:
					marks = EQUIVALENT*((competitor > 1) ? 1 : competitor);
					break;
				case 12:
					marks = EQUIVALENT*((competitor > 2) ? 2 : competitor);
					break;
				case 13:
					marks = EQUIVALENT*((competitor > 3) ? 3 : competitor);
					break;
				case 14:
					marks = -EQUIVALENT*chance;
					break;
				case 15:
					marks = EQUIVALENT*((theOtherChance > chance) ? ((chance * 2 > times) ? 0 : (theOtherChance - chance)) : ((chance * 2 > times) ? (theOtherChance - float(times) / 2) : (theOtherChance - chance)));
					break;
				default:
					;
				}//value a certain box not considering the surrounding
				decision1[k] = marks;
			}//value certain boxes not considering the surrounding
			for (k = 0; k < N_BOXES; k++)
			{
                if(n_acc != -1)
                {
                    if (k == 0 || k == COLS - 1 || k == N_BOXES - COLS || k == N_BOXES - 1)
                    {
                        decision2[k] = decision1[k] * n_acc / (n_acc + 4);
                    }
                    else if (k<COLS || k>N_BOXES - COLS - 1)
                    {
                        decision2[k] = (decision1[k] * n_acc + decision1[k - 1] + decision1[k + 1]) / (n_acc + 4);
                    }
                    else if ((k + 1) % COLS == 0 || (k + 1) % COLS == 1)
                    {
                        decision2[k] = (decision1[k] * n_acc + decision1[k - COLS] + decision1[k + COLS]) / (n_acc + 4);
                    }
                    else
                    {
                        decision2[k] = (decision1[k] * n_acc + decision1[k - COLS] + decision1[k - 1] + decision1[k + 1] + decision1[k + COLS]) / (n_acc + 4);
                    }
                }
                else
                {
                    decision2[k] = decision1[k];
                }
			}//expectation eq. to condsider the inaccurate
			for (k = 0; k < N_BOXES; k++)
			{
				if (decision2[k] > 0 && decision2[k] > compare)
				{
					compare = decision2[k];
					n = k;
				}
			}//look for the best box
			if (compare < 0)
			{
				n = N_BOXES + COLS;
			}//if all is bad, throw away
			//the bot ends
			i = (((n + 1) % COLS == 0) ? ((n + 1) / COLS) : ((n + 1) / COLS + 1));
			j = (((n + 1) % COLS == 0) ? COLS : ((n + 1) % COLS));//serial number to row & col. number
			cout << "Towards Row " << i << endl;
			cout << "Column " << j << endl;
			break;
		default:
			;
		}
        if(n_acc != -1)
        {
            mark = rand() % (4 + n_acc);
            switch (mark)
            {
            case 0:
                i--;
                cout << "Too high." << endl;
                break;
            case 1:
                i++;
                cout << "Too low." << endl;
                break;
            case 2:
                j--;
                cout << "Too far to the left." << endl;
                break;
            case 3:
                j++;
                cout << "Too far to the right." << endl;
                break;
            default:
                cout << "Got it." << endl;
            }
        }
		else
        {
            cout << "Got it." << endl;
        }
		if (i <= 0 || i > ROWS || j <= 0 || j > COLS)
		{
			cout << "Out of the target." << endl;
			return 1;
		}
		else if (given[list[(i - 1)*ROWS + j - 1]].key > 0)//deal with general boxes
		{
			change(given[list[(i - 1)*ROWS + j - 1]].key, given[list[(i - 1)*ROWS + j - 1]].a);
			return 1;
		}
		else//send to main for special boxes
		{
			return given[list[(i - 1)*ROWS + j - 1]].key;
		}
	}
}p1, p2;//A is p2, B is p1
int main()
{
	char continue0, computer;//again? bot?
	unsigned seed;//the seed for random numbers
	float acc;
	int times;
	cout << "\"=\": Your score becomes your opponent\'s score, but is ineffective if your opponent has no remaining chances." << endl;
	cout << "\"+\" \"++\" \"+++\": Increase your own throwing chances by 1, 2, or 3 times respectively, but one chance will still be consumed in this round." << endl;
	cout << "\"END\": Lose all your remaining throwing chances." << endl;
	cout << "\"~\": Your opponent\'s remaining throwing chances become the same as yours (after this round\'s consumption)." << endl;//note
	do
	{
		cout << "Computer version\? (n: no computer   /   Y: computer goes first, as player A   /   y: computer goes second, as player B   /   c: computer vs. computer) ";
		cin >> computer;
		cout << "Seed: ";
		cin >> seed;
		cout << "Player A\'s hit rate (enter a value between 0.429 and 0.999 for a more accurate hit rate calculation. 1 means always accurate): ";
		cin >> acc;
		if(acc - 1.0 < 0.00001 && 1.0 - acc < 0.00001)
        {
            p2.n_acc = -1;
        }
        else
        {
            p2.n_acc = 4.0 * acc / (1.0 - acc);
        }
		cout << "Player B\'s hit rate (enter a value between 0.429 and 0.999 for a more accurate hit rate calculation. 1 means always accurate): ";
		cin >> acc;
		if(acc - 1.0 < 0.00001 && 1.0 - acc < 0.00001)
        {
            p1.n_acc = -1;
        }
        else
        {
            p1.n_acc = 4.0 * acc / (1.0 - acc);
        }//accuracy to n_acc
		cout << "Total maximum number of throws: ";
		cin >> times;
		cout << "Number of throws for player A: ";
		cin >> p2.chance;
		cout << "Number of throws for player B: ";
		cin >> p1.chance;
		p1.point = 0;
		p2.point = 0;
		int i, j, h;
		int boxKey[N_BOXES];
		srand(seed);
		for (i = 0; i < N_BOXES; i++)
		{
			boxKey[i] = rand() % N_GIVEN;
		}//the serial numbers of the boxes to generate the target
		while (p1.chance + p2.chance > 0 && times != 0)
		{
			for (i = 0; i < ROWS; i++)
			{
				for (j = 0; j < COLS; j++)
				{
					cout << given[boxKey[i*ROWS + j]].ch << "\t";
				}
				cout << endl;
			}//draw the target
			if (p2.chance>0)
			{
				cout << "Player A        Remaining chances: " << p2.chance << " Score:  " << p2.point << endl;
				cout << "Player B        Remaining chances: " << p1.chance << " Score:  " << p1.point << endl;
				cout << "Total chances remaining for the game: " << times << endl;
				times--;
				cout << "Player A\'s turn:" << endl;
				h = p2.hurl(((computer == 'Y' || computer == 'c') ? 21 : 2), boxKey, times, p1.chance, p1.point);
				switch (h)//special boxes sent to main
				{
				case 0:
					if (p1.chance == 0 || times == 0)
					{
						;
					}
					else
					{
						p2.point = p1.point;
					}
					break;
				case -1:
					p1.chance = p2.chance;
					break;
				default:
					;
				}
			}
            if(times == 0)
            {
                break;
            }
			if (p1.chance>0)
			{
				cout << "Player A        Remaining chances: " << p2.chance << " Score:  " << p2.point << endl;
				cout << "Player B        Remaining chances: " << p1.chance << " Score:  " << p1.point << endl;
				cout << "Total chances remaining for the game: " << times << endl;
				times--;
				cout << "Player B\'s turn:" << endl;
				h = p1.hurl(((computer == 'y' || computer == 'c') ? 21 : 1), boxKey, times, p2.chance, p2.point);
				switch (h)//special boxes sent to main
				{
				case 0:
					if (p2.chance == 0 || times == 0)
					{
						;
					}
					else
					{
						p1.point = p2.point;
					}
					break;
				case -1:
					p2.chance = p1.chance;
					break;
				default:
					;
				}
			}
		}
		if (p1.point < p2.point)
		{
			cout << "A wins." << endl;
		}
		else if (p1.point == p2.point)
		{
			cout << "Tie." << endl;
		}
		else
		{
			cout << "B wins." << endl;
		}
		cout << "A Score: " << p2.point << endl;
		cout << "B Score: " << p1.point << endl;
		cout << "Continue\? (y/n) ";
		cin >> continue0;
	} while (continue0 != 'n'&&continue0 != 'N');
	return 0;
}