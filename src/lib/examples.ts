export type Example = {
  id: string;
  title: string;
  description: string;
  code: string;
};

export const EXAMPLES: Example[] = [
  {
    id: 'variables',
    title: 'Variables & Arithmetic',
    description: 'Basic assignment and math operations.',
    code: `a = 10
b = 5
sum_val = a + b
diff_val = a - b
print("Sum:", sum_val)
print("Difference:", diff_val)
`
  },
  {
    id: 'if-else',
    title: 'If / Else',
    description: 'Conditional execution branching.',
    code: `score = 85

if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
else:
    grade = 'C'

print("Grade is", grade)
`
  },
  {
    id: 'for-loop',
    title: 'For Loop Total',
    description: 'Iterating through a list to calculate a running total.',
    code: `numbers = [10, 20, 30]
total = 0

for num in numbers:
    total += num
    print("Added", num, "- Total is now", total)

print("Final total:", total)
`
  },
  {
    id: 'list-mutation',
    title: 'List Mutation',
    description: 'Modifying elements in a list.',
    code: `fruits = ['apple', 'banana', 'cherry']
print("Original:", fruits)

fruits.append('date')
fruits[1] = 'blueberry'

print("Modified:", fruits)
`
  },
  {
    id: 'functions',
    title: 'Function Calls',
    description: 'Defining and calling user functions.',
    code: `def greet(name):
    greeting = "Hello, " + name + "!"
    return greeting

msg1 = greet("Alice")
print(msg1)

msg2 = greet("Bob")
print(msg2)
`
  },
  {
    id: 'recursion',
    title: 'Recursive Factorial',
    description: 'A function that calls itself.',
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(4)
print("Factorial of 4 is", result)
`
  },
  {
    id: 'while-loop',
    title: 'While Loop',
    description: 'Looping until a condition is false.',
    code: `count = 3

while count > 0:
    print("Countdown:", count)
    count -= 1

print("Blastoff!")
`
  },
  {
    id: 'error',
    title: 'Runtime Error',
    description: 'See what happens when Python encounters an error.',
    code: `def divide_by_zero():
    numerator = 100
    denominator = 0
    return numerator / denominator

print("About to divide...")
divide_by_zero()
print("This line will not be reached.")
`
  }
];
